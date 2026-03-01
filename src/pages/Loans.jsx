import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";

import AppSnackbar from "../components/AppSnackbar";
import { getErrorMessage } from "../api/handleError";

export default function Loans() {
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [filter, setFilter] = useState("");

  const [borrowerId, setBorrowerId] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const loadAll = async () => {
    const [loanRes, bookRes, borrowerRes] = await Promise.all([
      axiosClient.get("/loans"),
      axiosClient.get("/books"),
      axiosClient.get("/borrowers"),
    ]);

    setLoans(loanRes.data);
    setBooks(bookRes.data);
    setBorrowers(borrowerRes.data);
  };

  useEffect(() => {
    loadAll().catch((err) => openSnack(getErrorMessage(err), "error"));
  }, []);

  const availableBooks = useMemo(
    () => books.filter((b) => b.status === "AVAILABLE"),
    [books]
  );

  const isOverdue = (loan) => {
    if (!loan?.dueDate) return false;
    if (loan.status !== "BORROWING") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(loan.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const filteredLoans = useMemo(() => {
    if (filter === "") return loans;

    if (filter === "OVERDUE") {
      return loans.filter(isOverdue);
    }

    return loans.filter((l) => l.status === filter);
  }, [loans, filter]);

  const borrow = async () => {
    if (!borrowerId || !bookId || !dueDate) {
      openSnack("Vui lòng chọn borrower, book và dueDate", "warning");
      return;
    }

    try {
      await axiosClient.post("/loans", {
        borrowerId: Number(borrowerId),
        bookId: Number(bookId),
        dueDate,
      });

      setBookId("");
      setDueDate("");
      openSnack("Mượn sách thành công ✅");
      await loadAll();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  const returnLoan = async (loanId) => {
    try {
      await axiosClient.post(`/loans/${loanId}/return`);
      openSnack("Trả sách thành công ✅");
      await loadAll();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  // ================= EXPORT CSV =================

  const toCsv = (rows) => {
    const escape = (v) => {
      const s = (v ?? "").toString().replaceAll('"', '""');
      return `"${s}"`;
    };

    const headers = [
      "Loan ID",
      "Borrower ID",
      "Borrower Name",
      "Book ID",
      "Book Title",
      "Borrow Date",
      "Due Date",
      "Return Date",
      "Status",
    ];

    const lines = [
      headers.join(","),
      ...rows.map((l) =>
        [
          l.id,
          l.borrower?.id,
          l.borrower?.fullName,
          l.book?.id,
          l.book?.title,
          l.borrowDate,
          l.dueDate,
          l.returnDate || "",
          l.status,
        ]
          .map(escape)
          .join(",")
      ),
    ];

    return lines.join("\n");
  };

  const downloadCsv = (filename, csvText) => {
    const BOM = "\uFEFF"; // hỗ trợ tiếng Việt
    const blob = new Blob([BOM + csvText], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportLoans = () => {
    if (!filteredLoans.length) {
      openSnack("Không có dữ liệu để xuất", "warning");
      return;
    }

    const csv = toCsv(filteredLoans);
    downloadCsv("loans_export.csv", csv);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Loans
      </Typography>

      {/* Borrow card */}
      {isAdmin && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mượn sách
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Borrower</InputLabel>
                <Select
                  label="Borrower"
                  value={borrowerId}
                  onChange={(e) => setBorrowerId(e.target.value)}
                >
                  {borrowers.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      #{b.id} — {b.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Book</InputLabel>
                <Select
                  label="Book"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                >
                  {availableBooks.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      #{b.id} — {b.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Due date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <Button variant="contained" onClick={borrow}>
                Borrow
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2}>
              <Button
                variant={filter === "" ? "contained" : "outlined"}
                onClick={() => setFilter("")}
              >
                ALL
              </Button>

              <Button
                variant={filter === "BORROWING" ? "contained" : "outlined"}
                onClick={() => setFilter("BORROWING")}
              >
                BORROWING
              </Button>

              <Button
                variant={filter === "RETURNED" ? "contained" : "outlined"}
                onClick={() => setFilter("RETURNED")}
              >
                RETURNED
              </Button>

              <Button
                variant={filter === "OVERDUE" ? "contained" : "outlined"}
                onClick={() => setFilter("OVERDUE")}
              >
                OVERDUE
              </Button>

              <Button variant="outlined" color="secondary" onClick={exportLoans}>
                Export Excel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Loan ID</TableCell>
            <TableCell>Borrower</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Borrow date</TableCell>
            <TableCell>Due date</TableCell>
            <TableCell>Return date</TableCell>
            <TableCell>Status</TableCell>
            {isAdmin && <TableCell align="right">Action</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredLoans.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.id}</TableCell>
              <TableCell>
                {l.borrower?.fullName} (#{l.borrower?.id})
              </TableCell>
              <TableCell>
                {l.book?.title} (#{l.book?.id})
              </TableCell>
              <TableCell>{l.borrowDate}</TableCell>
              <TableCell>{l.dueDate}</TableCell>
              <TableCell>{l.returnDate || "-"}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={l.status}
                    color={
                      l.status === "BORROWING" ? "warning" : "success"
                    }
                  />
                  {isOverdue(l) && (
                    <Chip size="small" label="OVERDUE" color="error" />
                  )}
                </Stack>
              </TableCell>

              {isAdmin && (
                <TableCell align="right">
                  {l.status === "BORROWING" ? (
                    <Button
                      variant="outlined"
                      onClick={() => returnLoan(l.id)}
                    >
                      Return
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </>
  );
}