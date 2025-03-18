from datasets import load_dataset
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
import uuid
import random

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./db/chat.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_evaluation_tables():
    """Create evaluation tables if they don't exist"""
    with engine.connect() as conn:
        conn.execute(
            text(
                """
            CREATE TABLE IF NOT EXISTS evaluation_results (
                id TEXT PRIMARY KEY,
                personality_id TEXT,
                dataset_id TEXT,
                prompt TEXT,
                response TEXT,
                category TEXT,
                cluster TEXT,
                score FLOAT,
                created_at TIMESTAMP,
                FOREIGN KEY (personality_id) REFERENCES personalities(id)
            )
        """
            )
        )
        conn.commit()


class Evaluator:
    def __init__(self, personality_id: str):
        self.personality_id = personality_id
        self.dataset = load_dataset("CohereForAI/m-ArenaHard", "en", split="test")
        create_evaluation_tables()

    def get_filtered_prompts(
        self, cluster: str, limit: int = 25
    ) -> List[Dict[str, Any]]:
        """Get random prompts from a specific cluster"""
        filtered_dataset = self.dataset.filter(lambda x: x["cluster"] == cluster)
        if len(filtered_dataset) == 0:
            return []

        # Convert to list and shuffle
        items = list(filtered_dataset)
        random.shuffle(items)

        # Take the first 'limit' items
        return items[:limit]

    def evaluate(self, cohere_client) -> List[Dict[str, Any]]:
        """Evaluate the personality against the dataset"""
        results = []

        for item in self.dataset:
            prompt = item["prompt"]
            dataset_id = item["question_id"]
            category = item["category"]
            cluster = item["cluster"]

            # Get response from Cohere
            response = cohere_client.chat(
                model=os.getenv("COHERE_MODEL", "command-light"),
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
            )

            generated_response = response.message.content[0].text.strip()

            # Store result
            result = {
                "id": str(uuid.uuid4()),
                "personality_id": self.personality_id,
                "dataset_id": dataset_id,
                "prompt": prompt,
                "response": generated_response,
                "category": category,
                "cluster": cluster,
                "score": 0.0,  # TODO: Implement scoring mechanism
                "created_at": datetime.utcnow(),
            }

            results.append(result)

            # Store in database
            with engine.connect() as conn:
                conn.execute(
                    text(
                        """
                    INSERT INTO evaluation_results 
                    (id, personality_id, dataset_id, prompt, response, category, cluster, score, created_at)
                    VALUES (:id, :personality_id, :dataset_id, :prompt, :response, :category, :cluster, :score, :created_at)
                """
                    ),
                    result,
                )
                conn.commit()

        return results

    def get_evaluation_summary(self) -> Dict[str, Any]:
        """Get summary of evaluation results"""
        with engine.connect() as conn:
            results = pd.read_sql_query(
                """
                SELECT * FROM evaluation_results 
                WHERE personality_id = :personality_id
            """,
                conn,
                params={"personality_id": self.personality_id},
            )

            return {
                "total_samples": len(results),
                "average_score": results["score"].mean(),
                "personality_id": self.personality_id,
                "categories": results["category"].unique().tolist(),
                "clusters": results["cluster"].unique().tolist(),
            }
