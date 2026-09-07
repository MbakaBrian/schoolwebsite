
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

// axiosInstance's baseURL already includes "/api/"
const RECEIPTS_URL = "receipts/";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  const [flashMessage, setFlashMessage] = useState(
    location.state?.message || null
  );

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get(RECEIPTS_URL);

      setReceipts(data.results ?? []);
      setTotalExpenditure(data.total_expenditure ?? 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load receipts."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(receiptId) {
    const confirmed = window.confirm(
      `Delete receipt ${receiptId}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(`${RECEIPTS_URL}${receiptId}/delete/`);

      setFlashMessage(`Receipt ${receiptId} deleted successfully.`);
      fetchReceipts();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          `Failed to delete receipt ${receiptId}.`
      );
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ============================================================
            FLASH MESSAGE
        ============================================================ */}
        {flashMessage && (
          <div className="mb-6 flex items-start justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                ✓
              </div>

              <span className="text-sm font-medium">
                {flashMessage}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              className="ml-4 text-lg text-green-700 transition hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================================
            ERROR MESSAGE
        ============================================================ */}
        {error && (
          <div className="mb-6 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                !
              </div>

              <span className="text-sm font-medium">
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-4 text-lg text-red-700 transition hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14.25l6-6m4.5-3.493V21.75l-7.5-3.75-7.5 3.75V4.757a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 4.757z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Receipts
              </h1>
            </div>

            <p className="text-sm text-gray-500">
              Manage school receipts, expenditures and payment records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            {/* Summary */}
            <Link
              to="/receipts/summary"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>

              Summary
            </Link>

            {/* Add Receipt */}
            <Link
              to="/receipts/add"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 hover:shadow-md"
            >
              <span className="text-lg leading-none">+</span>
              Add Receipt
            </Link>
          </div>
        </div>

        {/* ============================================================
            STATISTICS
        ============================================================ */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Total Receipts */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Receipts
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {receipts.length}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Recorded transactions
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* Total Expenditure */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Expenditure
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  KSh {Number(totalExpenditure).toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Total recorded spending
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* Current Year */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Year
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {currentYear}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Active financial records
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

            </div>
          </div>

        </div>

        {/* ============================================================
            LOADING
        ============================================================ */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-700"></div>

            <p className="text-sm font-medium text-gray-600">
              Loading receipts...
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Please wait while we retrieve your records.
            </p>
          </div>
        )}

        {/* ============================================================
            RECEIPTS TABLE
        ============================================================ */}
        {!loading && receipts.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Table Header */}
            <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recorded Receipts
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all recorded school receipts.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                {receipts.length} receipt
                {receipts.length !== 1 ? "s" : ""}
              </span>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Receipt ID
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Store
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Payment Method
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Total
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Recorded By
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">

                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.receipt_id}
                      className="transition hover:bg-purple-50/40"
                    >

                      {/* Receipt ID */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-semibold text-purple-700">
                          {receipt.receipt_id}
                        </span>
                      </td>

                      {/* Store */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {receipt.store}
                      </td>

                      {/* Payment Method */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {receipt.payment_method_display}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {new Date(receipt.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-bold text-gray-900">
                          KSh{" "}
                          {Number(receipt.total).toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Recorded By */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {receipt.recorded_by}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">

                          {/* View */}
                          <Link
                            to={`/receipts/${receipt.receipt_id}`}
                            className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                          >
                            View
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/receipts/${receipt.receipt_id}/edit`}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-100"
                          >
                            Edit
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(receipt.receipt_id)
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          </div>
        )}

        {/* ============================================================
            NO RECEIPTS
        ============================================================ */}
        {!loading && receipts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No receipts recorded
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              There are currently no receipts in the system. Start by
              recording your first school receipt.
            </p>

            <Link
              to="/receipts/add"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 hover:shadow-md"
            >
              <span className="text-lg leading-none">+</span>
              Add First Receipt
            </Link>

          </div>
        )}

      </div>
    </div>
  );
}
