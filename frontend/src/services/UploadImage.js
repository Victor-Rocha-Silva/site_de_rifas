import api from "./api";

export default async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/admin/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}