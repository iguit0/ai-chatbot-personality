"use client";

import { useState } from "react";
import { usePersonality } from "./personality-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalityEditor } from "./personality-editor";
import type { Personality } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PersonalitySelector() {
  const {
    personalities,
    selectedPersonality,
    setSelectedPersonality,
    deletePersonality,
  } = usePersonality();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPersonality, setEditingPersonality] =
    useState<Personality | null>(null);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Profiles</CardTitle>
        <CardDescription>
          Select or create a personality for your assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {personalities.map((personality) => (
                  <div
                    key={personality.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPersonality?.id === personality.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card hover:bg-accent/50 border-2 border-transparent"
                    }`}
                    onClick={() => setSelectedPersonality(personality)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{personality.name}</h3>
                      <Badge
                        variant={
                          personality.isDefault ? "secondary" : "outline"
                        }
                      >
                        {personality.isDefault ? "Default" : "Custom"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {personality.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {personalities.map((personality) => (
                  <div
                    key={personality.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{personality.name}</h3>
                      <div className="flex space-x-2">
                        <Dialog
                          open={editingPersonality?.id === personality.id}
                          onOpenChange={(open) => {
                            if (!open) setEditingPersonality(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPersonality(personality)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            {editingPersonality && (
                              <PersonalityEditor
                                personality={editingPersonality}
                                onClose={() => setEditingPersonality(null)}
                                mode="edit"
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        {!personality.isDefault && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Personality
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {personality.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() =>
                                    deletePersonality(personality.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {personality.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button
                  className="w-full mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Personality
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <PersonalityEditor
                  onClose={() => setIsCreating(false)}
                  mode="create"
                />
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedPersonality ? (
            <>
              Active:{" "}
              <span className="font-medium">{selectedPersonality.name}</span>
            </>
          ) : (
            "No personality selected"
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
