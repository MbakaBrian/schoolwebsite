import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// ICONS
// ============================================================

const Icons = {
    AcademicCap: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M22 10l-10-5-10 5 10 5 10-5z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M6 12.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M22 10v6"
            />
        </svg>
    ),

    Plus: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v14M5 12h14"
            />
        </svg>
    ),

    Search: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle
                cx="11"
                cy="11"
                r="7"
                strokeWidth={1.8}
            />
            <path
                strokeLinecap="round"
                strokeWidth={1.8}
                d="M20 20l-4-4"
            />
        </svg>
    ),

    Eye: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
            />
            <circle
                cx="12"
                cy="12"
                r="2.5"
                strokeWidth={1.8}
            />
        </svg>
    ),

    Edit: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 20h9"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
            />
        </svg>
    ),

    Trash: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 6h18M9 6V4h6v2M19 6l-1 14H6L5 6"
            />
            <path
                strokeLinecap="round"
                strokeWidth={1.8}
                d="M10 11v5M14 11v5"
            />
        </svg>
    ),

    Refresh: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M20 11a8.1 8.1 0 00-15.5-3M4 4v4h4M4 13a8.1 8.1 0 0015.5 3M20 20v-4h-4"
            />
        </svg>
    ),

    AlertCircle: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                strokeWidth={1.8}
            />
            <path
                strokeLinecap="round"
                strokeWidth={1.8}
                d="M12 8v4M12 16h.01"
            />
        </svg>
    ),

    CheckCircle: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                strokeWidth={1.8}
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 12l2.5 2.5L16 9"
            />
        </svg>
    ),

    XCircle: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                strokeWidth={1.8}
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 9l6 6M15 9l-6 6"
            />
        </svg>
    ),

    ChevronRight: ({ className = "w-5 h-5" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5l7 7-7 7"
            />
        </svg>
    ),
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const AcademicYearsPage = () => {

    const [academicYears, setAcademicYears] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [deletingId, setDeletingId] = useState(null);


    // ========================================================
    // FETCH ACADEMIC YEARS
    // ========================================================

    const fetchAcademicYears = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get(
                "/academics/years/"
            );

            const data = response.data;

            const years = Array.isArray(data)
                ? data
                : data.results || [];

            setAcademicYears(years);

        } catch (err) {
            console.error(
                "Failed to fetch academic years:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Failed to load academic years."
            );

        } finally {
            setLoading(false);
        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        fetchAcademicYears();
    }, []);


    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete = async (id, name) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete academic year ${name}?\n\n` +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);

        try {

            await axiosInstance.delete(
                `/academics/years/${id}/`
            );

            setAcademicYears((previous) =>
                previous.filter(
                    (year) => year.id !== id
                )
            );

        } catch (err) {

            console.error(
                "Failed to delete academic year:",
                err
            );

            const message =
                err?.response?.data?.detail ||
                "Failed to delete academic year.";

            setError(message);

        } finally {
            setDeletingId(null);
        }
    };


    // ========================================================
    // FILTER
    // ========================================================

    const filteredYears = academicYears.filter((year) => {

        const matchesSearch =
            year.name
                ?.toString()
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                );

        const matchesStatus =
            statusFilter === "all" ||
            (
                statusFilter === "current" &&
                year.is_current
            ) ||
            (
                statusFilter === "active" &&
                year.is_active
            ) ||
            (
                statusFilter === "inactive" &&
                !year.is_active
            );

        return (
            matchesSearch &&
            matchesStatus
        );
    });


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-KE",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                bg-white
                border-b border-gray-200
            ">

                <div className="
                    max-w-7xl
                    mx-auto
                    px-4 sm:px-6 lg:px-8
                    py-6
                ">

                    <div className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                text-gray-500
                                mb-1
                            ">
                                <Icons.AcademicCap
                                    className="w-4 h-4"
                                />

                                <span>
                                    Academics Management
                                </span>

                                <Icons.ChevronRight
                                    className="
                                        w-3.5
                                        h-3.5
                                        text-gray-400
                                    "
                                />

                                <span>
                                    Academic Years
                                </span>
                            </div>

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-bold
                                text-gray-900
                            ">
                                Academic Years
                            </h1>

                            <p className="
                                mt-1
                                text-sm
                                text-gray-500
                            ">
                                Manage academic years and their
                                configurations.
                            </p>

                        </div>


                        <Link
                            to="/academics/years/new"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-xl
                                bg-gray-900
                                text-white
                                text-sm
                                font-semibold
                                hover:bg-gray-800
                                transition
                            "
                        >
                            <Icons.Plus
                                className="w-4 h-4"
                            />

                            Add Academic Year
                        </Link>

                    </div>

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="
                max-w-7xl
                mx-auto
                px-4 sm:px-6 lg:px-8
                py-6
            ">


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="
                        mb-6
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border border-red-200
                        bg-red-50
                        p-4
                        text-red-700
                    ">

                        <Icons.AlertCircle
                            className="
                                w-5
                                h-5
                                flex-shrink-0
                                mt-0.5
                            "
                        />

                        <div className="flex-1">

                            <p className="font-medium">
                                Something went wrong
                            </p>

                            <p className="
                                text-sm
                                mt-1
                            ">
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={() => setError("")}
                            className="
                                text-red-400
                                hover:text-red-600
                            "
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-3
                    gap-4
                    mb-6
                ">

                    <div className="
                        bg-white
                        border border-gray-200
                        rounded-2xl
                        p-5
                        shadow-sm
                    ">
                        <p className="
                            text-sm
                            text-gray-500
                        ">
                            Total Years
                        </p>

                        <p className="
                            mt-1
                            text-3xl
                            font-bold
                            text-gray-900
                        ">
                            {loading
                                ? "—"
                                : academicYears.length}
                        </p>
                    </div>


                    <div className="
                        bg-white
                        border border-gray-200
                        rounded-2xl
                        p-5
                        shadow-sm
                    ">
                        <p className="
                            text-sm
                            text-gray-500
                        ">
                            Current Year
                        </p>

                        <p className="
                            mt-1
                            text-3xl
                            font-bold
                            text-gray-900
                        ">
                            {loading
                                ? "—"
                                : academicYears.find(
                                    (year) =>
                                        year.is_current
                                )?.name || "—"}
                        </p>
                    </div>


                    <div className="
                        bg-white
                        border border-gray-200
                        rounded-2xl
                        p-5
                        shadow-sm
                    ">
                        <p className="
                            text-sm
                            text-gray-500
                        ">
                            Active Years
                        </p>

                        <p className="
                            mt-1
                            text-3xl
                            font-bold
                            text-gray-900
                        ">
                            {loading
                                ? "—"
                                : academicYears.filter(
                                    (year) =>
                                        year.is_active
                                ).length}
                        </p>
                    </div>

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="
                    bg-white
                    border border-gray-200
                    rounded-2xl
                    shadow-sm
                    p-4
                    mb-6
                ">

                    <div className="
                        flex
                        flex-col
                        md:flex-row
                        gap-3
                    ">

                        {/* Search */}

                        <div className="
                            relative
                            flex-1
                        ">

                            <Icons.Search
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    w-4
                                    h-4
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search academic years..."
                                className="
                                    w-full
                                    pl-10
                                    pr-4
                                    py-2.5
                                    rounded-xl
                                    border border-gray-200
                                    text-sm
                                    outline-none
                                    focus:border-gray-400
                                    focus:ring-2
                                    focus:ring-gray-100
                                "
                            />

                        </div>


                        {/* Status */}

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="
                                md:w-48
                                px-4
                                py-2.5
                                rounded-xl
                                border border-gray-200
                                bg-white
                                text-sm
                                text-gray-700
                                outline-none
                                focus:border-gray-400
                            "
                        >
                            <option value="all">
                                All Years
                            </option>

                            <option value="current">
                                Current
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>

                        </select>


                        {/* Refresh */}

                        <button
                            onClick={fetchAcademicYears}
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-xl
                                border border-gray-200
                                text-sm
                                font-medium
                                text-gray-700
                                hover:bg-gray-50
                                disabled:opacity-50
                                transition
                            "
                        >
                            <Icons.Refresh
                                className={`
                                    w-4
                                    h-4
                                    ${loading
                                        ? "animate-spin"
                                        : ""}
                                `}
                            />

                            Refresh
                        </button>

                    </div>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="
                    bg-white
                    border border-gray-200
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">

                    {/* Table Header */}

                    <div className="
                        px-5
                        py-4
                        border-b border-gray-200
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <h2 className="
                                font-semibold
                                text-gray-900
                            ">
                                All Academic Years
                            </h2>

                            <p className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            ">
                                {loading
                                    ? "Loading..."
                                    : `${filteredYears.length} year${
                                        filteredYears.length === 1
                                            ? ""
                                            : "s"
                                    }`}
                            </p>

                        </div>

                    </div>


                    {/* Desktop Table */}

                    <div className="
                        hidden
                        md:block
                        overflow-x-auto
                    ">

                        <table className="
                            w-full
                            text-left
                        ">

                            <thead className="
                                bg-gray-50
                                border-b border-gray-200
                            ">
                                <tr>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Academic Year
                                    </th>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Start Date
                                    </th>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        End Date
                                    </th>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Terms
                                    </th>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Status
                                    </th>

                                    <th className="
                                        px-5
                                        py-3
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                        text-right
                                    ">
                                        Actions
                                    </th>

                                </tr>
                            </thead>


                            <tbody className="
                                divide-y
                                divide-gray-100
                            ">

                                {loading ? (

                                    [1, 2, 3].map((item) => (

                                        <tr key={item}>

                                            <td
                                                colSpan="6"
                                                className="px-5 py-5"
                                            >
                                                <div className="
                                                    h-5
                                                    bg-gray-200
                                                    rounded
                                                    animate-pulse
                                                    w-full
                                                " />
                                            </td>

                                        </tr>

                                    ))

                                ) : filteredYears.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="
                                                px-5
                                                py-12
                                                text-center
                                            "
                                        >

                                            <Icons.AcademicCap
                                                className="
                                                    w-10
                                                    h-10
                                                    mx-auto
                                                    text-gray-300
                                                "
                                            />

                                            <p className="
                                                mt-3
                                                font-medium
                                                text-gray-700
                                            ">
                                                No academic years found
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                text-gray-500
                                            ">
                                                Try changing your filters
                                                or create a new academic
                                                year.
                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredYears.map((year) => (

                                        <tr
                                            key={year.id}
                                            className="
                                                hover:bg-gray-50
                                                transition
                                            "
                                        >

                                            {/* Year */}

                                            <td className="px-5 py-4">

                                                <Link
                                                    to={`/academics/years/${year.id}`}
                                                    className="
                                                        font-semibold
                                                        text-gray-900
                                                        hover:underline
                                                    "
                                                >
                                                    {year.name}
                                                </Link>

                                            </td>


                                            {/* Start */}

                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                                text-gray-600
                                            ">
                                                {formatDate(
                                                    year.start_date
                                                )}
                                            </td>


                                            {/* End */}

                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                                text-gray-600
                                            ">
                                                {formatDate(
                                                    year.end_date
                                                )}
                                            </td>


                                            {/* Terms */}

                                            <td className="
                                                px-5
                                                py-4
                                            ">

                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    px-2.5
                                                    py-1
                                                    rounded-lg
                                                    bg-gray-100
                                                    text-gray-700
                                                    text-xs
                                                    font-medium
                                                ">
                                                    {year.terms?.length || 0}
                                                    {" / 3"}
                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td className="px-5 py-4">

                                                <div className="
                                                    flex
                                                    flex-wrap
                                                    gap-1.5
                                                ">

                                                    {year.is_current && (
                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1
                                                            px-2.5
                                                            py-1
                                                            rounded-full
                                                            bg-gray-900
                                                            text-white
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            <Icons.CheckCircle
                                                                className="
                                                                    w-3.5
                                                                    h-3.5
                                                                "
                                                            />

                                                            Current
                                                        </span>
                                                    )}

                                                    {year.is_active ? (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1
                                                            px-2.5
                                                            py-1
                                                            rounded-full
                                                            bg-gray-100
                                                            text-gray-700
                                                            text-xs
                                                            font-medium
                                                        ">
                                                            Active
                                                        </span>

                                                    ) : (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1
                                                            px-2.5
                                                            py-1
                                                            rounded-full
                                                            bg-gray-100
                                                            text-gray-500
                                                            text-xs
                                                            font-medium
                                                        ">
                                                            <Icons.XCircle
                                                                className="
                                                                    w-3.5
                                                                    h-3.5
                                                                "
                                                            />

                                                            Inactive
                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* Actions */}

                                            <td className="
                                                px-5
                                                py-4
                                            ">

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-end
                                                    gap-1
                                                ">

                                                    <Link
                                                        to={`/academics/years/${year.id}`}
                                                        title="View"
                                                        className="
                                                            p-2
                                                            rounded-lg
                                                            text-gray-500
                                                            hover:bg-gray-100
                                                            hover:text-gray-900
                                                            transition
                                                        "
                                                    >
                                                        <Icons.Eye
                                                            className="w-4 h-4"
                                                        />
                                                    </Link>

                                                    <Link
                                                        to={`/academics/years/${year.id}/edit`}
                                                        title="Edit"
                                                        className="
                                                            p-2
                                                            rounded-lg
                                                            text-gray-500
                                                            hover:bg-gray-100
                                                            hover:text-gray-900
                                                            transition
                                                        "
                                                    >
                                                        <Icons.Edit
                                                            className="w-4 h-4"
                                                        />
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                year.id,
                                                                year.name
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            year.id
                                                        }
                                                        title="Delete"
                                                        className="
                                                            p-2
                                                            rounded-lg
                                                            text-gray-400
                                                            hover:bg-red-50
                                                            hover:text-red-600
                                                            disabled:opacity-50
                                                            transition
                                                        "
                                                    >
                                                        {deletingId ===
                                                        year.id ? (

                                                            <Icons.Refresh
                                                                className="
                                                                    w-4
                                                                    h-4
                                                                    animate-spin
                                                                "
                                                            />

                                                        ) : (

                                                            <Icons.Trash
                                                                className="w-4 h-4"
                                                            />

                                                        )}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        MOBILE CARDS
                    ================================================= */}

                    <div className="
                        md:hidden
                        divide-y
                        divide-gray-100
                    ">

                        {loading ? (

                            [1, 2, 3].map((item) => (

                                <div
                                    key={item}
                                    className="p-5 animate-pulse"
                                >

                                    <div className="
                                        h-5
                                        bg-gray-200
                                        rounded
                                        w-20
                                    " />

                                    <div className="
                                        mt-3
                                        h-4
                                        bg-gray-200
                                        rounded
                                        w-40
                                    " />

                                </div>

                            ))

                        ) : filteredYears.length === 0 ? (

                            <div className="
                                p-10
                                text-center
                            ">

                                <Icons.AcademicCap
                                    className="
                                        w-10
                                        h-10
                                        mx-auto
                                        text-gray-300
                                    "
                                />

                                <p className="
                                    mt-3
                                    font-medium
                                    text-gray-700
                                ">
                                    No academic years found
                                </p>

                            </div>

                        ) : (

                            filteredYears.map((year) => (

                                <div
                                    key={year.id}
                                    className="
                                        p-5
                                    "
                                >

                                    <div className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-4
                                    ">

                                        <div>

                                            <Link
                                                to={`/academics/years/${year.id}`}
                                                className="
                                                    text-lg
                                                    font-bold
                                                    text-gray-900
                                                "
                                            >
                                                {year.name}
                                            </Link>

                                            <p className="
                                                mt-1
                                                text-sm
                                                text-gray-500
                                            ">
                                                {formatDate(
                                                    year.start_date
                                                )}
                                                {" — "}
                                                {formatDate(
                                                    year.end_date
                                                )}
                                            </p>

                                        </div>


                                        <div className="
                                            flex
                                            flex-wrap
                                            justify-end
                                            gap-1
                                        ">

                                            {year.is_current && (
                                                <span className="
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    bg-gray-900
                                                    text-white
                                                    text-[10px]
                                                    font-semibold
                                                ">
                                                    Current
                                                </span>
                                            )}

                                            <span className="
                                                px-2
                                                py-1
                                                rounded-full
                                                bg-gray-100
                                                text-gray-600
                                                text-[10px]
                                                font-medium
                                            ">
                                                {year.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="
                                        mt-4
                                        grid
                                        grid-cols-2
                                        gap-3
                                    ">

                                        <div className="
                                            rounded-lg
                                            bg-gray-50
                                            p-3
                                        ">

                                            <p className="
                                                text-xs
                                                text-gray-500
                                            ">
                                                Terms
                                            </p>

                                            <p className="
                                                mt-1
                                                font-semibold
                                                text-gray-900
                                            ">
                                                {year.terms?.length || 0}
                                                {" / 3"}
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-lg
                                            bg-gray-50
                                            p-3
                                        ">

                                            <p className="
                                                text-xs
                                                text-gray-500
                                            ">
                                                Status
                                            </p>

                                            <p className="
                                                mt-1
                                                font-semibold
                                                text-gray-900
                                            ">
                                                {year.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="
                                        mt-4
                                        flex
                                        items-center
                                        gap-2
                                    ">

                                        <Link
                                            to={`/academics/years/${year.id}`}
                                            className="
                                                flex-1
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-2
                                                px-3
                                                py-2
                                                rounded-lg
                                                bg-gray-900
                                                text-white
                                                text-sm
                                                font-medium
                                            "
                                        >
                                            <Icons.Eye
                                                className="w-4 h-4"
                                            />

                                            View
                                        </Link>

                                        <Link
                                            to={`/academics/years/${year.id}/edit`}
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                p-2
                                                rounded-lg
                                                border border-gray-200
                                                text-gray-600
                                                hover:bg-gray-50
                                            "
                                            title="Edit"
                                        >
                                            <Icons.Edit
                                                className="w-4 h-4"
                                            />
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    year.id,
                                                    year.name
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                year.id
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                p-2
                                                rounded-lg
                                                border border-gray-200
                                                text-gray-500
                                                hover:bg-red-50
                                                hover:text-red-600
                                                disabled:opacity-50
                                            "
                                            title="Delete"
                                        >
                                            {deletingId === year.id ? (

                                                <Icons.Refresh
                                                    className="
                                                        w-4
                                                        h-4
                                                        animate-spin
                                                    "
                                                />

                                            ) : (

                                                <Icons.Trash
                                                    className="w-4 h-4"
                                                />

                                            )}

                                        </button>

                                    </div>

                                </div>

                            ))
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
};


export default AcademicYearsPage;
