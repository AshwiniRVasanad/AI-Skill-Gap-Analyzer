import type { Page } from "@/App";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { Mic, Shield, TrendingUp, Users } from "lucide-react";
import { useEffect } from "react";

interface Props {
  navigate: (page: Page) => void;
}

export default function AdminPage({ navigate }: Props) {
  const user = JSON.parse(localStorage.getItem("vexora_user") || "{}");
  const { actor } = useActor();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once on mount
  useEffect(() => {
    if (!user.isAdmin) navigate("home");
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => actor!.getUserStats(),
    enabled: !!actor,
  });

  const { data: profiles } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: () => actor!.getAllUserProfiles(),
    enabled: !!actor,
  });

  const totalInterviews = stats?.reduce((a, b) => a + Number(b[2]), 0) || 0;
  const totalUsers = stats?.length || 0;
  const allInterviews = profiles?.flatMap((p) => p.interviews) || [];
  const avgScore =
    allInterviews.length > 0
      ? Math.round(
          allInterviews.reduce((a, b) => a + Number(b.score), 0) /
            allInterviews.length,
        )
      : 0;

  const statCards = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Total Interviews", value: totalInterviews, icon: Mic },
    { label: "Avg Score", value: `${avgScore}/100`, icon: TrendingUp },
    { label: "Admin Panel", value: "Active", icon: Shield },
  ];

  return (
    <Layout isAdmin navigate={navigate} currentPage="admin">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">
          Admin <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Monitor all users and application activity.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="bg-card border-border">
                <CardContent className="p-4">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="font-display text-2xl font-bold text-gradient">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display">User Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles && profiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Resumes</TableHead>
                    <TableHead>Interviews</TableHead>
                    <TableHead>Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p, i) => {
                    const avg =
                      p.interviews.length > 0
                        ? Math.round(
                            p.interviews.reduce(
                              (a, b) => a + Number(b.score),
                              0,
                            ) / p.interviews.length,
                          )
                        : 0;
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: profile list from backend
                      <TableRow key={i}>
                        <TableCell className="font-semibold">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.email}
                        </TableCell>
                        <TableCell>{p.resumes.length}</TableCell>
                        <TableCell>{p.interviews.length}</TableCell>
                        <TableCell className="text-primary font-semibold">
                          {avg}/100
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No users yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
