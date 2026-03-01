import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Grid, Typography, Card, CardContent } from "@mui/material";

function StatCard({ title, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/dashboard/summary").then((res) => setData(res.data));
  }, []);

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        <StatCard title="Tổng sách" value={data.totalBooks} />
        <StatCard title="Sách còn" value={data.availableBooks} />
        <StatCard title="Đang mượn" value={data.borrowedBooks} />
        <StatCard title="Người mượn" value={data.totalBorrowers} />
        <StatCard title="Phiếu mượn" value={data.borrowingLoans} />
        <StatCard title="Quá hạn" value={data.overdueLoans} />
      </Grid>
    </>
  );
}
