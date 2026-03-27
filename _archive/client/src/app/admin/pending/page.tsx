"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  estimated_hours?: number;
}

export default function PendingTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTasks();
    const interval = setInterval(fetchPendingTasks, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingTasks = async () => {
    try {
      const response = await fetch("/api/admin/tasks/pending");
      const data = await response.json();
      setTasks(data.tasks || []);
      setPendingCount(data.count || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading pending tasks...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Tasks</h1>
        <div className={`text-4xl font-bold ${pendingCount === 0 ? "text-green-500" : "text-red-500"}`}>
          {pendingCount} TASKS
        </div>
      </div>

      {pendingCount === 0 ? (
        <Card className="bg-green-50 border-green-500">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              0 TASKS PENDING
            </div>
            <div className="text-gray-600">
              All tasks completed! BELL24h Empire is running smoothly.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === "critical" ? "bg-red-500 text-white" :
                    task.priority === "high" ? "bg-orange-500 text-white" :
                    task.priority === "medium" ? "bg-yellow-500 text-white" :
                    "bg-gray-500 text-white"
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{task.category}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                {task.estimated_hours && (
                  <div className="text-xs text-gray-500">
                    Est: {task.estimated_hours}h
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

