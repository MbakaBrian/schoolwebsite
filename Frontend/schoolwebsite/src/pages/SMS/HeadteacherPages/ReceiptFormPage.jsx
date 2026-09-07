import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const RECEIPTS_URL = "receipts/";

// Mirrors Receipt.PAYMENT_METHODS from the model.
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
  { value: "EFT", label: "EFT" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  store: "",
  payment_method: "",
  date: "",
  payment_reference: "",
  description: "",
  attachment: null,
};

export default function ReceiptFormPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(receiptId);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (editing) {
      fetchReceipt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId]);

  async function fetchReceipt() {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get(`${RECEIPTS_URL}${receiptId}/`);

      setForm({
        store: data.store,
        payment_method: data.payment_method,
        date: data.date,
        payment_reference: data.payment_reference || "",
        description: data.description || "",
        attachment: null,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || `Failed to load receipt ${receiptId}.`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    // Clear the error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = new FormData();

    payload.append("store", form.store);
    payload.append("payment_method", form.payment_method);
    payload.append("date", form.date);

    if (form.payment_reference) {
      payload.append("payment_reference", form.payment_reference);
    }

    if (form.description) {
      payload.append("description", form.description);
    }

    if (form.attachment) {
      payload.append("attachment", form.attachment);
    }

    try {
      if (editing) {
        await axiosInstance.patch(
          `${RECEIPTS_URL}${receiptId}/edit/`,
          payload
        );

        navigate(`/receipts/${receiptId}`, {
          state: {
            message: `Receipt ${receiptId} updated successfully.`,
          },
        });
      } else {
        const { data } = await axiosInstance.post(
          `${RECEIPTS_URL}add/`,
          payload
        );

        navigate(`/receipts/${data.receipt_id}`, {
          state: {
            message: `Receipt ${data.receipt_id} created successfully.`,
          },
        });
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setFieldErrors(err.response.data);
      } else {
        setError(
          err.response?.data?.detail || "Failed to save receipt."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-700 transition mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-purple-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 14h6m-6 4h6M9 6h6m2 14H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {editing ? `Edit ${receiptId}` : "Add Receipt"}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {editing
                  ? "Update the receipt information below."
                  : "Enter the details of the new receipt."}
              </p>
            </div>
          </div>
        </div>

        {/* General Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13a2 2 0 001.71 2.64h15.64a2 2 0 001.71-2.64l-7.82-13a2 2 0 00-3.42 0z"
              />
            </svg>

            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-5 sm:px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Receipt Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Provide the basic information associated with this receipt.
            </p>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 space-y-6">

            {/* Store */}
            <div>
              <label
                htmlFor="store"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Store <span className="text-red-500">*</span>
              </label>

              <input
                id="store"
                type="text"
                name="store"
                value={form.store}
                onChange={handleChange}
                required
                placeholder="Enter store or supplier name"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                  fieldErrors.store
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                }`}
              />

              {fieldErrors.store && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.store[0]}
                </p>
              )}
            </div>

            {/* Payment Method + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Payment Method */}
              <div>
                <label
                  htmlFor="payment_method"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Payment Method <span className="text-red-500">*</span>
                </label>

                <select
                  id="payment_method"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white outline-none transition ${
                    fieldErrors.payment_method
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                >
                  <option value="">Select method...</option>

                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>

                {fieldErrors.payment_method && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.payment_method[0]}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Date <span className="text-red-500">*</span>
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition ${
                    fieldErrors.date
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                />

                {fieldErrors.date && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.date[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Reference */}
            <div>
              <label
                htmlFor="payment_reference"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Payment Reference
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="payment_reference"
                type="text"
                name="payment_reference"
                value={form.payment_reference}
                onChange={handleChange}
                placeholder="e.g. M-Pesa code, cheque number, transaction ID"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                  fieldErrors.payment_reference
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                }`}
              />

              {fieldErrors.payment_reference && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.payment_reference[0]}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Add any additional information about this receipt..."
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Attachment */}
            <div>
              <label
                htmlFor="attachment"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Attachment
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (Optional — image or PDF)
                </span>
              </label>

              <div
                className={`rounded-xl border-2 border-dashed p-5 transition ${
                  fieldErrors.attachment
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-purple-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14a2 2 0 002-2v-3a2 2 0 00-2-2h-1"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <input
                      id="attachment"
                      type="file"
                      name="attachment"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-100 file:text-purple-700
                        hover:file:bg-purple-200
                        file:cursor-pointer"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Accepted formats: JPG, JPEG, PNG, PDF
                    </p>
                  </div>
                </div>
              </div>

              {form.attachment && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2v6h6"
                    />
                  </svg>

                  <span className="truncate">
                    {form.attachment.name}
                  </span>
                </div>
              )}

              {fieldErrors.attachment && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.attachment[0]}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              )}

              {saving
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Add Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}