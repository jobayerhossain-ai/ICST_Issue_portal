import { useEffect, useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
}

export default function PendingIssues() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Issue[]>([]);

  const fetchPending = async () => {
    try {
      const { data } = await api.get<Array<Issue & { _id: string }>>('/issues');
      const mappedData = data
        .filter((i) => i.status === "pending")
        .map((item) => ({ ...item, id: item._id }));
      setPending(mappedData);
    } catch (error) {
      console.error("Failed to fetch issues", error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/issues/${id}/status`, { status: "verified" });
      toast({ title: "Approved", description: "Issue moved to verified." });
      fetchPending();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/issues/${id}/status`, { status: "rejected" });
      toast({ title: "Rejected", variant: "destructive" });
      fetchPending();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
        Pending Issues
      </h1>

      <div className="space-y-4 max-w-3xl">
        {pending.map(issue => (
          <Card key={issue.id} className="p-5 flex justify-between">
            <div className="w-2/3">
              <h2 className="font-semibold">{issue.title}</h2>
              <p className="text-sm opacity-70">{issue.description}</p>

              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{issue.category}</Badge>
                <Badge variant="secondary">{issue.location}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={() => navigate(`/admin/add-issue?id=${issue.id}`)}>
                Edit
              </Button>
              <Button onClick={() => handleAccept(issue.id)}>Accept</Button>
              <Button variant="destructive" onClick={() => handleReject(issue.id)}>
                Reject
              </Button>
            </div>
          </Card>
        ))}

        {pending.length === 0 && (
          <p className="opacity-60">No pending issues available.</p>
        )}
      </div>
    </div>
  );
}
