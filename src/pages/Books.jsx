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

export default function Books() {
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Add
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    previewText: "",
  });

  // Edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    previewText: "",
  });

  // Delete
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const load = async () => {
    const res = await axiosClient.get("/books");
    setBooks(res.data);
  };

  useEffect(() => {
    load().catch((err) => openSnack(getErrorMessage(err), "error"));
  }, []);

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" || b.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const resetAddForm = () => {
    setForm({ title: "", author: "", category: "", isbn: "", previewText: "" });
  };

  const createBook = async () => {
    if (!form.title.trim()) {
      openSnack("Title không được để trống", "warning");
      return;
    }

    try {
      await axiosClient.post("/books", form);
      setOpenAdd(false);
      resetAddForm();
      openSnack("Thêm sách thành công ✅");
      await load();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  const openEditDialog = (book) => {
    setEditId(book.id);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      isbn: book.isbn || "",
      previewText: book.previewText || "",
    });
    setOpenEdit(true);
  };

  const updateBook = async () => {
    if (!editId) return;

    try {
      await axiosClient.put(`/books/${editId}`, editForm);
      setOpenEdit(false);
      setEditId(null);
      openSnack("Cập nhật sách thành công ✅");
      await load();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  const openDeleteDialog = (book) => {
    setDeleteTarget(book);
    setOpenDelete(true);
  };

  const deleteBook = async () => {
    if (!deleteTarget?.id) return;

    try {
      await axiosClient.delete(`/books/${deleteTarget.id}`);
      setOpenDelete(false);
      setDeleteTarget(null);
      openSnack("Xoá sách thành công ✅");
      await load();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  const uploadCover = async (bookId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post(`/books/${bookId}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      openSnack("Upload ảnh thành công ✅");
      await load();
    } catch (err) {
      openSnack(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Books</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            + Add Book
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search title / ISBN"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value="ALL">All</option>
          <option value="AVAILABLE">Available</option>
          <option value="BORROWED">Borrowed</option>
        </TextField>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cover</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredBooks.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                {b.coverImageUrl ? (
                  <img
                    src={`http://localhost:8080${b.coverImageUrl}`}
                    alt="cover"
                    style={{ width: 48, height: 64, objectFit: "cover" }}
                  />
                ) : "-"}
              </TableCell>

              <TableCell>{b.id}</TableCell>
              <TableCell>{b.title}</TableCell>
              <TableCell>{b.author}</TableCell>
              <TableCell>{b.category}</TableCell>
              <TableCell>{b.isbn}</TableCell>
              <TableCell>{b.status}</TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setPreviewBook(b);
                      setPreviewOpen(true);
                    }}
                  >
                    Preview
                  </Button>

                  {isAdmin && (
                    <>
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

                      <Button variant="outlined" component="label">
                        Upload
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            uploadCover(b.id, file);
                          }}
                        />
                      </Button>
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* ADD BOOK DIALOG */}
      <Dialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          resetAddForm();
        }}
        fullWidth
      >
        <DialogTitle>Add Book</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              label="Author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <TextField
              label="ISBN"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            />
            <TextField
              label="Preview text"
              multiline
              minRows={3}
              value={form.previewText}
              onChange={(e) =>
                setForm({ ...form, previewText: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              resetAddForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={createBook}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Preview: {previewBook?.title}</DialogTitle>
        <DialogContent dividers>
          {previewBook?.previewText?.trim()
            ? previewBook.previewText
            : "Chưa có nội dung preview."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditId(null);
        }}
        fullWidth
      >
        <DialogTitle>Edit Book #{editId}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />
            <TextField
              label="Author"
              value={editForm.author}
              onChange={(e) =>
                setEditForm({ ...editForm, author: e.target.value })
              }
            />
            <TextField
              label="Category"
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
            />
            <TextField
              label="ISBN"
              value={editForm.isbn}
              onChange={(e) =>
                setEditForm({ ...editForm, isbn: e.target.value })
              }
            />
            <TextField
              label="Preview text"
              multiline
              minRows={3}
              value={editForm.previewText}
              onChange={(e) =>
                setEditForm({ ...editForm, previewText: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenEdit(false);
              setEditId(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={updateBook}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteTarget(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          Bạn chắc chắn muốn xoá:
          <b> #{deleteTarget?.id} — {deleteTarget?.title}</b> ?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDelete(false);
              setDeleteTarget(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteBook}
          >
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