import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";

import AppSnackbar from "../components/AppSnackbar";
import { getErrorMessage } from "../api/handleError";

export default function Borrowers() {
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const [borrowers, setBorrowers] = useState([]);
  const [search, setSearch] = useState("");

  // Add
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });

  // Edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  // Delete
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const resetForm = () => {
    setForm({ fullName: "", phone: "", email: "", address: "" });
  };

  const load = async () => {
    const res = await axiosClient.get("/borrowers");
    setBorrowers(res.data);
  };

  useEffect(() => {
    load().catch((err) => openSnack(getErrorMessage(err), "error"));
  }, []);

  const filteredBorrowers = borrowers.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      b.fullName?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q)
    );
  });

  const createBorrower = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      openSnack("Full name và phone không được để trống", "warning");
      return;
    }

    try {
      await axiosClient.post("/borrowers", form);
      setOpenAdd(false);
      resetForm();
      openSnack("Thêm borrower thành công ✅");
      await load();
    } catch (err) {
      const status = err?.response?.status;
      openSnack(getErrorMessage(err), status === 409 ? "warning" : "error");
    }
  };

  const openEditDialog = (b) => {
    setEditing(b);
    setForm({
      fullName: b.fullName || "",
      phone: b.phone || "",
      email: b.email || "",
      address: b.address || "",
    });
    setOpenEdit(true);
  };

  const updateBorrower = async () => {
    if (!editing) return;

    if (!form.fullName.trim() || !form.phone.trim()) {
      openSnack("Full name và phone không được để trống", "warning");
      return;
    }

    try {
      await axiosClient.put(`/borrowers/${editing.id}`, form);
      setOpenEdit(false);
      setEditing(null);
      resetForm();
      openSnack("Cập nhật borrower thành công ✅");
      await load();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  const openDeleteDialog = (b) => {
    setDeleting(b);
    setOpenDelete(true);
  };

  const deleteBorrower = async () => {
    if (!deleting) return;

    try {
      await axiosClient.delete(`/borrowers/${deleting.id}`);
      setOpenDelete(false);
      setDeleting(null);
      openSnack("Xoá borrower thành công ✅");
      await load();
    } catch (err) {
      const status = err?.response?.status;
      openSnack(getErrorMessage(err), status === 409 ? "warning" : "error");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Borrowers</Typography>

        {isAdmin && (
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            + Add Borrower
          </Button>
        )}
      </Stack>

      <TextField
        label="Search name / phone / email"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Full name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Address</TableCell>
            {isAdmin && <TableCell align="right">Action</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredBorrowers.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.id}</TableCell>
              <TableCell>{b.fullName}</TableCell>
              <TableCell>{b.phone}</TableCell>
              <TableCell>{b.email}</TableCell>
              <TableCell>{b.address}</TableCell>

              {isAdmin && (
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEditDialog(b)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => openDeleteDialog(b)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          resetForm();
        }}
        fullWidth
      >
        <DialogTitle>Add Borrower</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={createBorrower}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
          resetForm();
        }}
        fullWidth
      >
        <DialogTitle>Edit Borrower #{editing?.id}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenEdit(false);
              setEditing(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={updateBorrower}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleting(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent dividers>
          Bạn có chắc muốn xoá borrower{" "}
          <b>{deleting?.fullName}</b> (#{deleting?.id}) không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteBorrower}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </>
  );
}