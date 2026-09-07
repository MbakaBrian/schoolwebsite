import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const RECEIPTS_URL = "receipts/";

const DEPARTMENTS = [
  ["transport", "Transport"],
  ["classes", "Classes"],
  ["library", "Library"],
  ["office", "Office"],
  ["boarding", "Boarding"],
  ["sports", "Sports"],
  ["security", "Security"],
  ["school_maintenance", "School Maintenance"],
  ["catering_dining", "Catering / Dining"],
  ["ict", "ICT"],
  ["administration", "Administration"],
  ["medical", "Medical"],
  ["laboratory_science", "Laboratory / Science"],
  ["human_resource", "Human Resource"],
  ["agriculture", "Agriculture"],
  ["utilities", "Utilities"],
];

export default function ReceiptSummaryPage() {
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    department: "",
  });

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSummary(activeFilters = filters) {
    setLoading(true);
    setError(null);

    try {
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v)
      );

      const { data } = await axiosInstance.get(
        `${RECEIPTS_URL}summary/`,
        { params }
      );

      setSummary(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load summary."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleApplyFilters(e) {
    e.preventDefault();
    fetchSummary(filters);
  }

  function handleClearFilters() {
    const cleared = {
      date_from: "",
      date_to: "",
      department: "",
    };

    setFilters(cleared);
    fetchSummary(cleared);
  }

  async function handleExport(kind) {
    setExporting(kind);
    setError(null);

    const isFiltered = kind === "filtered";

    const url = isFiltered
      ? `${RECEIPTS_URL}summary/export/filtered/`
      : `${RECEIPTS_URL}summary/export/`;

    const params = isFiltered
      ? Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v)
        )
      : Object.fromEntries(
          Object.entries(filters)
            .filter(([k]) => k !== "department")
            .filter(([, v]) => v)
        );

    try {
      const response = await axiosInstance.get(url, {
        params,
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = blobUrl;

      link.download = isFiltered
        ? "filtered_expenditure.xlsx"
        : "receipt_summary.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError("Failed to generate export.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

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
                    d="M3 3v18h18"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16l4-4 3 3 5-6"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Expenditure Summary
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Breakdown of receipt items by department.
                </p>
              </div>
            </div>

            <Link
              to="/receipts"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
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

        {/* Filters */}
        <form
          onSubmit={handleApplyFilters}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
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
                    d="M3 4h18M6 8h12M9 12h6M11 16h2M10 20h4"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Filter Summary
                </h2>

                <p className="text-sm text-gray-500">
                  Select a date range or department to narrow the results.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">

              {/* From */}
              <div>
                <label
                  htmlFor="date_from"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  From
                </label>

                <input
                  id="date_from"
                  type="date"
                  name="date_from"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* To */}
              <div>
                <label
                  htmlFor="date_to"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  To
                </label>

                <input
                  id="date_to"
                  type="date"
                  name="date_to"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Department
                </label>

                <select
                  id="department"
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">All departments</option>

                  {DEPARTMENTS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                      d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                  Apply
                </button>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-sm text-gray-500">
              Loading summary...
            </p>
          </div>
        ) : summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

              {/* Total Expenditure */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Expenditure
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                      KSh{" "}
                      {Number(
                        summary.total_expenditure
                      ).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v12"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 12a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Items
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                      {summary.total_items}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5a3 3 0 016 0v1H9V5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6M9 16h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Receipts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Receipts
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                      {summary.total_receipts}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-700"
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
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">

              {/* Header */}
              <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Breakdown by Department
                  </h2>

                  <p className="text-sm text-gray-500 mt-0.5">
                    Expenditure distribution across departments.
                  </p>
                </div>
              </div>

              {/* Table */}
              {summary.department_summary?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Department
                        </th>

                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Items
                        </th>

                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Receipts
                        </th>

                        <th className="px-5 py-3.5 text-right text-xs font-semibold text-white uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {summary.department_summary.map((row) => (
                        <tr
                          key={row.department}
                          className="hover:bg-purple-50/40 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                                {row.department
                                  ?.substring(0, 2)
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm font-semibold text-gray-900">
                                {row.department}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {row.item_count}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {row.receipt_count}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                            KSh{" "}
                            {Number(row.total).toLocaleString(
                              "en-KE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                        d="M3 3v18h18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16l4-4 3 3 5-6"
                      />
                    </svg>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800">
                    No data found
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    There is no expenditure data for the selected filters.
                  </p>
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Export Reports
                </h2>

                <p className="text-sm text-gray-500 mt-0.5">
                  Download the expenditure data as an Excel spreadsheet.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">

                  {/* Receipt Summary Export */}
                  <button
                    type="button"
                    onClick={() => handleExport("receipts")}
                    disabled={exporting !== null}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting === "receipts" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
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
                            d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14a2 2 0 002-2v-3a2 2 0 00-2-2h-1"
                          />
                        </svg>
                        Export Receipt Summary (.xlsx)
                      </>
                    )}
                  </button>

                  {/* Filtered Export */}
                  <button
                    type="button"
                    onClick={() => handleExport("filtered")}
                    disabled={exporting !== null}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting === "filtered" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
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
                            d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14a2 2 0 002-2v-3a2 2 0 00-2-2h-1"
                          />
                        </svg>
                        Export Filtered Expenditure (.xlsx)
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
                  <p className="text-xs text-purple-800">
                    <span className="font-semibold">Tip:</span>{" "}
                    The filtered export uses the currently selected date
                    range and department.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}