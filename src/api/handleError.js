export function getErrorMessage(err) {
  const res = err?.response;
  if (!res) return "Không kết nối được server (backend chưa chạy hoặc CORS).";

  const data = res.data;

  // nếu backend trả string
  if (typeof data === "string") return data;

  // nếu backend trả JSON có message
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  return `Lỗi ${res.status}: ${res.statusText || "Unknown error"}`;
}
