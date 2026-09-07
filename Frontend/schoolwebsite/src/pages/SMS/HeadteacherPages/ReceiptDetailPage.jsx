import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const RECEIPTS_URL = "receipts/";

export default function ReceiptDetailPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId]);

  async function fetchReceipt() {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get(`${RECEIPTS_URL}${receiptId}/`);
      setReceipt(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || `Failed to load receipt ${receiptId}.`
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete receipt ${receiptId}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`${RECEIPTS_URL}${receiptId}/delete/`);

      navigate("/receipts", {
        state: {
          message: `Receipt ${receiptId} deleted successfully.`,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          `Failed to delete receipt ${receiptId}.`
      );
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

  if (error && !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-5">
            <div className="flex items-start gap-3">
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
          </div>

          <Link
            to="/receipts"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white text-sm font-semibold hover:bg-gray-800 transition"
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
            Back to Receipts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
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
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <Link
            to="/receipts"
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
            Back to Receipts
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Receipt Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
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
                  {receipt.receipt_id}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  {receipt.store}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/receipts/${receiptId}/items`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Manage Items
              </Link>

              <Link
                to={`/receipts/${receiptId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition shadow-sm"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
                Edit
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition shadow-sm"
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
                    d="M6 7h12M10 11v6m4-6v6M9 7V4h6v3m-8 0l1 13h8l1-13"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

          {/* Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Receipt Details
              </h2>
            </div>

            <div className="p-5">
              <dl className="divide-y divide-gray-100">

                {/* Payment Method */}
                <div className="py-3 first:pt-0 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Payment Method
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {receipt.payment_method_display}
                  </dd>
                </div>

                {/* Date */}
                <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Date
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {new Date(receipt.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </div>

                {/* Payment Reference */}
                <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Payment Reference
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 break-words">
                    {receipt.payment_reference || "—"}
                  </dd>
                </div>

                {/* Recorded By */}
                <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Recorded By
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {receipt.recorded_by}
                  </dd>
                </div>

                {/* Description */}
                <div className="py-3 last:pb-0 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="text-sm text-gray-700 whitespace-pre-wrap">
                    {receipt.description || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Total Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Expense Summary
              </h2>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-purple-50 border border-purple-100 p-5">
                <p className="text-sm font-medium text-purple-700">
                  Total Expense
                </p>

                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                  KSh {Number(receipt.total).toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Total amount recorded for this receipt
                </p>
              </div>

              {/* Attachment */}
              {receipt.attachment && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Receipt Attachment
                  </p>

                  <a
                    href={receipt.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Items Header */}
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Items
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Items recorded under this receipt
              </p>
            </div>

            <span className="inline-flex items-center self-start sm:self-auto px-3 py-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
              {receipt.items?.length ?? 0} item
              {receipt.items?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            {receipt.items?.length ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Item
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Department
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Quantity
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Unit Price
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-white uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {receipt.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/40 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                            {item.item_name
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <span className="text-sm font-semibold text-gray-900">
                            {item.item_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.department_display}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          {item.quantity}
                        </span>{" "}
                        {item.unit_display}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        KSh{" "}
                        {Number(item.unit_price).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                        KSh{" "}
                        {Number(item.total).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 px-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-400"
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

                <h3 className="text-sm font-semibold text-gray-800">
                  No items added yet
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add items to this receipt using the Manage Items button.
                </p>

                <Link
                  to={`/receipts/${receiptId}/items`}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                >
                  Manage Items
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-5 flex justify-start">
          <Link
            to="/receipts"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
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
            Back to Receipts
          </Link>
        </div>
      </div>
    </div>
  );
}