"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InterviewListItem,
  type InterviewListItemData,
} from "@/components/interview/interview-list-item";

export function InterviewsClient({
  items,
}: {
  items: InterviewListItemData[];
}) {
  const [tab, setTab] = React.useState("all");

  const filtered = items.filter((i) => {
    if (tab === "all") return true;
    if (tab === "active") return i.status !== "COMPLETED";
    return i.status === "COMPLETED";
  });

  const counts = {
    all: items.length,
    active: items.filter((i) => i.status !== "COMPLETED").length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        <TabsTrigger value="active">In progress ({counts.active})</TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({counts.completed})
        </TabsTrigger>
      </TabsList>

      <div className="mt-5 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <InterviewListItem key={item.id} item={item} />
          ))
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        )}
      </div>
    </Tabs>
  );
}
