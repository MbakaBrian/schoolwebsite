import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";


// ============================================================
// ICONS
// ============================================================

const Icons = {

    AcademicCap: ({ className = "w-6 h-6" }) => (
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


    Calendar: ({ className = "w-6 h-6" }) => (
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
                d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
        </svg>
    ),


    Users: ({ className = "w-6 h-6" }) => (
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
                d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />

            <circle
                cx="9"
                cy="7"
                r="4"
                strokeWidth={1.8}
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            />
        </svg>
    ),


    Layers: ({ className = "w-6 h-6" }) => (
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
                d="M12 2L2 7l10 5 10-5-10-5z"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M2 12l10 5 10-5M2 17l10 5 10-5"
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


    ArrowRight: ({ className = "w-5 h-5" }) => (
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
                d="M9 5l7 7-7 7"
            />
        </svg>
    ),


    Clock: ({ className = "w-5 h-5" }) => (
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
                d="M12 7v5l3 2"
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
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    href,
    loading = false,
}) => {
    return (
        <Link
            to={href}
            className="
                group
                rounded-2xl
                border border-gray-200
                bg-gray-100
                p-5
                shadow-sm
                hover:bg-white
                hover:border-purple-200
                hover:shadow-md
                transition-all
                duration-200
            "
        >

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    {loading ? (
                        <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                            {value}
                        </p>
                    )}

                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">
                            {subtitle}
                        </p>
                    )}

                </div>


                <div
                    className="
                        w-11 h-11
                        rounded-xl
                        bg-purple-100
                        text-purple-700
                        flex items-center justify-center
                        group-hover:bg-purple-700
                        group-hover:text-white
                        transition-colors
                    "
                >
                    {icon}
                </div>

            </div>

        </Link>
    );
};


// ============================================================
// QUICK ACTION
// ============================================================

const QuickAction = ({
    title,
    description,
    href,
    icon,
}) => {
    return (
        <Link
            to={href}
            className="
                group
                flex items-center gap-4
                p-4
                rounded-xl
                border border-gray-200
                bg-gray-100
                hover:bg-white
                hover:border-purple-200
                hover:shadow-sm
                transition-all
            "
        >

            <div
                className="
                    w-10 h-10
                    rounded-lg
                    bg-purple-100
                    text-purple-700
                    flex items-center justify-center
                    flex-shrink-0
                    group-hover:bg-purple-700
                    group-hover:text-white
                    transition-colors
                "
            >
                {icon}
            </div>


            <div className="flex-1 min-w-0">

                <p className="font-semibold text-gray-900 text-sm">
                    {title}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                    {description}
                </p>

            </div>


            <Icons.ArrowRight
                className="
                    w-4 h-4
                    text-gray-400
                    group-hover:text-purple-700
                    transition-colors
                "
            />

        </Link>
    );
};


// ============================================================
// MAIN DASHBOARD
// ============================================================

const AcademicsDashboard = () => {

    const [academicYear, setAcademicYear] = useState(null);

    const [academicYears, setAcademicYears] = useState([]);

    const [terms, setTerms] = useState([]);

    const [calendarEvents, setCalendarEvents] = useState([]);

    const [classLevels, setClassLevels] = useState([]);

    const [streams, setStreams] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ========================================================
    // FETCH DASHBOARD DATA
    // ========================================================

    const fetchDashboardData = async () => {

        setLoading(true);
        setError("");

        try {

            const [
                yearsResponse,
                termsResponse,
                eventsResponse,
                classesResponse,
                streamsResponse,
            ] = await Promise.all([

                // IMPORTANT:
                // Fetch ALL years.
                // We determine the current year from
                // the actual is_current field below.

                axiosInstance.get(
                    "/academics/years/"
                ),

                axiosInstance.get(
                    "/academics/terms/"
                ),

                axiosInstance.get(
                    "/academics/calendar-events/?is_active=true"
                ),

                axiosInstance.get(
                    "/academics/class-levels/?is_active=true"
                ),

                axiosInstance.get(
                    "/academics/streams/?is_active=true"
                ),

            ]);


            // ------------------------------------------------
            // ACADEMIC YEARS
            // ------------------------------------------------

            const yearsData = yearsResponse.data;

            const years = Array.isArray(yearsData)
                ? yearsData
                : yearsData?.results || [];

            setAcademicYears(years);


            // ------------------------------------------------
            // DETERMINE CURRENT ACADEMIC YEAR
            // ------------------------------------------------
            //
            // DO NOT simply use years[0].
            //
            // The active year is the one explicitly marked:
            //
            // is_current: true
            //
            // ------------------------------------------------

            const currentYear =
                years.find(
                    (year) =>
                        year.is_current === true
                ) || null;

            setAcademicYear(currentYear);


            // ------------------------------------------------
            // TERMS
            // ------------------------------------------------

            const termsData =
                termsResponse.data;

            const termsList =
                Array.isArray(termsData)
                    ? termsData
                    : termsData?.results || [];

            setTerms(termsList);


            // ------------------------------------------------
            // CALENDAR EVENTS
            // ------------------------------------------------

            const eventsData =
                eventsResponse.data;

            const eventsList =
                Array.isArray(eventsData)
                    ? eventsData
                    : eventsData?.results || [];

            setCalendarEvents(eventsList);


            // ------------------------------------------------
            // CLASS LEVELS
            // ------------------------------------------------

            const classesData =
                classesResponse.data;

            const classesList =
                Array.isArray(classesData)
                    ? classesData
                    : classesData?.results || [];

            setClassLevels(classesList);


            // ------------------------------------------------
            // STREAMS
            // ------------------------------------------------

            const streamsData =
                streamsResponse.data;

            const streamsList =
                Array.isArray(streamsData)
                    ? streamsData
                    : streamsData?.results || [];

            setStreams(streamsList);

        } catch (err) {

            console.error(
                "Failed to load academics dashboard:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Failed to load academic information."
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        fetchDashboardData();

    }, []);


    // ========================================================
    // CURRENT TERM
    // ========================================================

    const currentTerm = useMemo(() => {

        if (!academicYear) {
            return null;
        }

        return (
            terms.find(
                (term) =>
                    term.is_current === true &&
                    String(term.academic_year) ===
                        String(academicYear.id)
            ) || null
        );

    }, [terms, academicYear]);


    // ========================================================
    // UPCOMING EVENTS
    // ========================================================

    const upcomingEvents = useMemo(() => {

        const now = new Date();

        return [...calendarEvents]
            .filter((event) => {

                if (!event.start_date) {
                    return false;
                }

                return new Date(event.start_date) >= now;

            })
            .sort(
                (a, b) =>
                    new Date(a.start_date) -
                    new Date(b.start_date)
            )
            .slice(0, 5);

    }, [calendarEvents]);


    // ========================================================
    // YEAR PROGRESS
    // ========================================================

    const calculateYearProgress = () => {

        if (
            !academicYear?.start_date ||
            !academicYear?.end_date
        ) {
            return 0;
        }

        const start = new Date(
            academicYear.start_date
        ).getTime();

        const end = new Date(
            academicYear.end_date
        ).getTime();

        const now = new Date().getTime();

        if (now <= start) {
            return 0;
        }

        if (now >= end) {
            return 100;
        }

        return Math.round(
            ((now - start) /
                (end - start)) *
                100
        );
    };


    const yearProgress =
        calculateYearProgress();


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

        <div className="min-h-screen bg-gray-100">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-purple-900 text-white border-b border-purple-950">

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-4 sm:px-6 lg:px-8
                        py-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-4
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-purple-200
                                    mb-1
                                "
                            >

                                <Icons.AcademicCap
                                    className="w-4 h-4"
                                />

                                <span>
                                    Academics Management
                                </span>

                            </div>


                            <h1
                                className="
                                    text-2xl
                                    sm:text-3xl
                                    font-bold
                                "
                            >
                                Academic Dashboard
                            </h1>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-purple-200
                                "
                            >
                                Manage the school's academic
                                structure, terms, classes and
                                calendar.
                            </p>

                        </div>


                        <div className="flex items-center gap-3">

                            {/* Academic Years */}

                            <Link
                                to="/academics/years"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    bg-white
                                    text-purple-800
                                    text-sm
                                    font-semibold
                                    hover:bg-purple-50
                                    transition
                                "
                            >

                                <Icons.Calendar
                                    className="w-4 h-4"
                                />

                                Academic Years

                            </Link>


                            {/* Refresh */}

                            <button
                                onClick={
                                    fetchDashboardData
                                }
                                disabled={loading}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    border border-purple-700
                                    bg-purple-800
                                    text-sm
                                    font-medium
                                    text-white
                                    hover:bg-purple-700
                                    disabled:opacity-50
                                    transition
                                "
                            >

                                <Icons.Refresh
                                    className={`w-4 h-4 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-4 sm:px-6 lg:px-8
                    py-6
                "
            >

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-6
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border border-red-200
                            bg-red-50
                            p-4
                            text-red-700
                        "
                    >

                        <Icons.AlertCircle
                            className="
                                w-5 h-5
                                flex-shrink-0
                                mt-0.5
                            "
                        />

                        <div>

                            <p className="font-medium">
                                Unable to load academic data
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    CURRENT ACADEMIC YEAR
                ================================================= */}

                <div
                    className="
                        bg-gray-900
                        rounded-2xl
                        p-6
                        text-white
                        mb-6
                        shadow-sm
                        border border-gray-800
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-6
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-purple-300
                                "
                            >

                                <Icons.Calendar
                                    className="w-4 h-4"
                                />

                                Current Academic Year

                            </div>


                            {loading ? (

                                <div
                                    className="
                                        mt-2
                                        h-9
                                        w-32
                                        rounded
                                        bg-gray-700
                                        animate-pulse
                                    "
                                />

                            ) : (

                                <h2
                                    className="
                                        mt-1
                                        text-3xl
                                        font-bold
                                    "
                                >
                                    {academicYear?.name ||
                                        "No current year"}
                                </h2>

                            )}


                            {academicYear && (

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-gray-400
                                    "
                                >

                                    {formatDate(
                                        academicYear.start_date
                                    )}

                                    {" — "}

                                    {formatDate(
                                        academicYear.end_date
                                    )}

                                </p>

                            )}

                        </div>


                        {/* Current Term */}

                        <div
                            className="
                                min-w-[240px]
                                rounded-xl
                                bg-purple-900/50
                                border border-purple-700/50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    uppercase
                                    tracking-wide
                                    text-purple-300
                                "
                            >
                                Current Term
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-lg
                                    font-semibold
                                "
                            >
                                {currentTerm?.term_display ||
                                    "Not set"}
                            </p>


                            {currentTerm && (

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-400
                                    "
                                >

                                    {formatDate(
                                        currentTerm.start_date
                                    )}

                                    {" — "}

                                    {formatDate(
                                        currentTerm.end_date
                                    )}

                                </p>

                            )}

                        </div>

                    </div>


                    {/* Year Progress */}

                    {academicYear && (

                        <div className="mt-6">

                            <div
                                className="
                                    flex
                                    justify-between
                                    text-xs
                                    text-gray-400
                                    mb-2
                                "
                            >

                                <span>
                                    Academic year progress
                                </span>

                                <span>
                                    {yearProgress}%
                                </span>

                            </div>


                            <div
                                className="
                                    h-2
                                    bg-gray-800
                                    rounded-full
                                    overflow-hidden
                                "
                            >

                                <div
                                    className="
                                        h-full
                                        bg-purple-500
                                        rounded-full
                                        transition-all
                                    "
                                    style={{
                                        width:
                                            `${yearProgress}%`,
                                    }}
                                />

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                        mb-6
                    "
                >

                    <StatCard
                        title="Academic Years"
                        value={academicYears.length}
                        subtitle="Configured years"
                        href="/academics/years"
                        icon={
                            <Icons.Calendar
                                className="w-5 h-5"
                            />
                        }
                        loading={loading}
                    />


                    <StatCard
                        title="Academic Terms"
                        value={terms.length}
                        subtitle="Configured terms"
                        href="/academics/terms"
                        icon={
                            <Icons.Calendar
                                className="w-5 h-5"
                            />
                        }
                        loading={loading}
                    />


                    <StatCard
                        title="Class Levels"
                        value={classLevels.length}
                        subtitle="Active classes"
                        href="/academics/classes"
                        icon={
                            <Icons.Layers
                                className="w-5 h-5"
                            />
                        }
                        loading={loading}
                    />


                    <StatCard
                        title="Streams"
                        value={streams.length}
                        subtitle="Active streams"
                        href="/academics/streams"
                        icon={
                            <Icons.Users
                                className="w-5 h-5"
                            />
                        }
                        loading={loading}
                    />

                </div>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-3
                        gap-6
                    "
                >

                    {/* =================================================
                        TERMS
                    ================================================= */}

                    <div
                        className="
                            lg:col-span-2
                            bg-gray-50
                            border border-gray-200
                            rounded-2xl
                            shadow-sm
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                px-5
                                py-4
                                bg-gray-200
                                border-b border-gray-300
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    Academic Terms
                                </h2>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    Terms for the current
                                    academic year
                                </p>

                            </div>


                            <Link
                                to="/academics/terms"
                                className="
                                    text-sm
                                    font-semibold
                                    text-purple-700
                                    hover:text-purple-900
                                "
                            >
                                View all
                            </Link>

                        </div>


                        <div className="divide-y divide-gray-200">

                            {loading ? (

                                [1, 2, 3].map(
                                    (item) => (

                                        <div
                                            key={item}
                                            className="
                                                p-5
                                                animate-pulse
                                            "
                                        >

                                            <div
                                                className="
                                                    h-4
                                                    bg-gray-200
                                                    rounded
                                                    w-24
                                                "
                                            />

                                            <div
                                                className="
                                                    mt-2
                                                    h-3
                                                    bg-gray-200
                                                    rounded
                                                    w-40
                                                "
                                            />

                                        </div>

                                    )
                                )

                            ) : !academicYear ? (

                                <div
                                    className="
                                        p-8
                                        text-center
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    No current academic year
                                    has been configured.
                                </div>

                            ) : (

                                terms
                                    .filter(
                                        (term) =>
                                            String(
                                                term.academic_year
                                            ) ===
                                            String(
                                                academicYear.id
                                            )
                                    )
                                    .sort(
                                        (a, b) =>
                                            String(
                                                a.term
                                            ).localeCompare(
                                                String(
                                                    b.term
                                                )
                                            )
                                    )
                                    .map(
                                        (term) => (

                                            <Link
                                                key={
                                                    term.id
                                                }
                                                to={`/academics/terms/${term.id}`}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    p-5
                                                    bg-gray-50
                                                    hover:bg-white
                                                    transition
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            w-9
                                                            h-9
                                                            rounded-lg
                                                            bg-purple-100
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-purple-700
                                                        "
                                                    >

                                                        <Icons.Calendar
                                                            className="w-4 h-4"
                                                        />

                                                    </div>


                                                    <div>

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-semibold
                                                                    text-gray-900
                                                                "
                                                            >
                                                                {
                                                                    term.term_display
                                                                }
                                                            </p>


                                                            {term.is_current && (

                                                                <span
                                                                    className="
                                                                        inline-flex
                                                                        items-center
                                                                        gap-1
                                                                        px-2
                                                                        py-0.5
                                                                        rounded-full
                                                                        bg-purple-100
                                                                        text-purple-700
                                                                        text-[10px]
                                                                        font-semibold
                                                                    "
                                                                >

                                                                    <Icons.CheckCircle
                                                                        className="w-3 h-3"
                                                                    />

                                                                    Current

                                                                </span>

                                                            )}

                                                        </div>


                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-500
                                                                mt-1
                                                        "
                                                        >

                                                            {formatDate(
                                                                term.start_date
                                                            )}

                                                            {" — "}

                                                            {formatDate(
                                                                term.end_date
                                                            )}

                                                        </p>

                                                    </div>

                                                </div>


                                                <Icons.ArrowRight
                                                    className="
                                                        w-4
                                                        h-4
                                                        text-gray-400
                                                    "
                                                />

                                            </Link>

                                        )
                                    )

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div
                        className="
                            bg-gray-50
                            border border-gray-200
                            rounded-2xl
                            shadow-sm
                            p-5
                        "
                    >

                        <div className="mb-4">

                            <h2
                                className="
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Quick Actions
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Common academic management
                                tasks
                            </p>

                        </div>


                        <div className="space-y-3">

                            {/* YEARS */}

                            <QuickAction
                                title="Manage Academic Years"
                                description="View and manage academic years"
                                href="/academics/years"
                                icon={
                                    <Icons.Calendar
                                        className="w-5 h-5"
                                    />
                                }
                            />


                            {/* ADD YEAR */}

                            <QuickAction
                                title="Add Academic Year"
                                description="Create a new academic year"
                                href="/academics/years/new"
                                icon={
                                    <Icons.Plus
                                        className="w-5 h-5"
                                    />
                                }
                            />


                            {/* ADD TERM */}

                            <QuickAction
                                title="Add Term"
                                description="Configure a school term"
                                href="/academics/terms/new"
                                icon={
                                    <Icons.Plus
                                        className="w-5 h-5"
                                    />
                                }
                            />


                            {/* CALENDAR */}

                            <QuickAction
                                title="Add Calendar Event"
                                description="Add a holiday or school event"
                                href="/academics/calendar/new"
                                icon={
                                    <Icons.Plus
                                        className="w-5 h-5"
                                    />
                                }
                            />


                            {/* CLASSES */}

                            <QuickAction
                                title="Manage Classes"
                                description="Manage grades and class levels"
                                href="/academics/classes"
                                icon={
                                    <Icons.Layers
                                        className="w-5 h-5"
                                    />
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    UPCOMING EVENTS
                ================================================= */}

                <div
                    className="
                        mt-6
                        bg-gray-50
                        border border-gray-200
                        rounded-2xl
                        shadow-sm
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            px-5
                            py-4
                            bg-gray-200
                            border-b border-gray-300
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div>

                            <h2
                                className="
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Upcoming Academic Events
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Important dates on the school
                                calendar
                            </p>

                        </div>


                        <Link
                            to="/academics/calendar"
                            className="
                                text-sm
                                font-semibold
                                text-purple-700
                                hover:text-purple-900
                            "
                        >
                            View calendar
                        </Link>

                    </div>


                    <div className="divide-y divide-gray-200">

                        {loading ? (

                            [1, 2, 3].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            p-5
                                            animate-pulse
                                        "
                                    >

                                        <div
                                            className="
                                                h-4
                                                bg-gray-200
                                                rounded
                                                w-48
                                            "
                                        />

                                        <div
                                            className="
                                                mt-2
                                                h-3
                                                bg-gray-200
                                                rounded
                                                w-32
                                            "
                                        />

                                    </div>

                                )
                            )

                        ) : upcomingEvents.length === 0 ? (

                            <div
                                className="
                                    p-8
                                    text-center
                                "
                            >

                                <Icons.Calendar
                                    className="
                                        w-8
                                        h-8
                                        mx-auto
                                        text-gray-300
                                    "
                                />

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    No upcoming academic events.
                                </p>

                            </div>

                        ) : (

                            upcomingEvents.map(
                                (event) => (

                                    <Link
                                        key={event.id}
                                        to={`/academics/calendar/${event.id}`}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            p-5
                                            bg-gray-50
                                            hover:bg-white
                                            transition
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                                min-w-0
                                            "
                                        >

                                            <div
                                                className="
                                                    w-10
                                                    h-10
                                                    rounded-xl
                                                    bg-purple-100
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-purple-700
                                                    flex-shrink-0
                                                "
                                            >

                                                <Icons.Calendar
                                                    className="w-5 h-5"
                                                />

                                            </div>


                                            <div className="min-w-0">

                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-900
                                                        truncate
                                                    "
                                                >
                                                    {event.title}
                                                </p>


                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                        mt-1
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        {formatDate(
                                                            event.start_date
                                                        )}
                                                    </span>


                                                    <span
                                                        className="
                                                            text-gray-300
                                                        "
                                                    >
                                                        •
                                                    </span>


                                                    <span
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        {
                                                            event.event_type_display
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <Icons.ArrowRight
                                            className="
                                                w-4
                                                h-4
                                                text-gray-400
                                                flex-shrink-0
                                            "
                                        />

                                    </Link>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* =================================================
                    ACADEMIC STRUCTURE
                ================================================= */}

                <div
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                    "
                >

                    {/* =================================================
                        CLASS LEVELS
                    ================================================= */}

                    <div
                        className="
                            bg-gray-50
                            border border-gray-200
                            rounded-2xl
                            shadow-sm
                            p-5
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    Class Levels
                                </h2>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    Active grades and classes
                                </p>

                            </div>


                            <Link
                                to="/academics/classes"
                                className="
                                    text-sm
                                    font-semibold
                                    text-purple-700
                                    hover:text-purple-900
                                "
                            >
                                Manage
                            </Link>

                        </div>


                        {classLevels.length === 0 ? (

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    py-4
                                "
                            >
                                No class levels configured.
                            </p>

                        ) : (

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    sm:grid-cols-3
                                    gap-2
                                "
                            >

                                {classLevels
                                    .slice(0, 9)
                                    .map(
                                        (classLevel) => (

                                            <Link
                                                key={
                                                    classLevel.id
                                                }
                                                to={`/academics/classes/${classLevel.id}`}
                                                className="
                                                    rounded-lg
                                                    border border-gray-200
                                                    bg-gray-100
                                                    p-3
                                                    hover:bg-white
                                                    hover:border-purple-200
                                                    transition
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-900
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        classLevel.name
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        mt-1
                                                    "
                                                >
                                                    {
                                                        classLevel.streams_count ??
                                                        0
                                                    }

                                                    {" "}

                                                    streams
                                                </p>

                                            </Link>

                                        )
                                    )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        ACADEMIC STATUS
                    ================================================= */}

                    <div
                        className="
                            bg-gray-50
                            border border-gray-200
                            rounded-2xl
                            shadow-sm
                            p-5
                        "
                    >

                        <div className="mb-4">

                            <h2
                                className="
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Academic Status
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Configuration overview
                            </p>

                        </div>


                        <div className="space-y-3">

                            {/* ACADEMIC YEAR */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    p-3
                                    rounded-lg
                                    bg-gray-100
                                    border border-gray-200
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icons.CheckCircle
                                        className="
                                            w-5
                                            h-5
                                            text-purple-700
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            text-gray-700
                                        "
                                    >
                                        Academic Year
                                    </span>

                                </div>


                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {academicYear
                                        ? academicYear.name
                                        : "Not Set"}
                                </span>

                            </div>


                            {/* CURRENT TERM */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    p-3
                                    rounded-lg
                                    bg-gray-100
                                    border border-gray-200
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icons.CheckCircle
                                        className="
                                            w-5
                                            h-5
                                            text-purple-700
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            text-gray-700
                                        "
                                    >
                                        Current Term
                                    </span>

                                </div>


                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {currentTerm
                                        ? currentTerm.term_display
                                        : "Not Set"}
                                </span>

                            </div>


                            {/* TERMS */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    p-3
                                    rounded-lg
                                    bg-gray-100
                                    border border-gray-200
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icons.CheckCircle
                                        className="
                                            w-5
                                            h-5
                                            text-purple-700
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            text-gray-700
                                        "
                                    >
                                        Terms
                                    </span>

                                </div>


                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {terms.filter(
                                        (term) =>
                                            academicYear &&
                                            String(
                                                term.academic_year
                                            ) ===
                                            String(
                                                academicYear.id
                                            )
                                    ).length}
                                    /3
                                </span>

                            </div>


                            {/* CLASS LEVELS */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    p-3
                                    rounded-lg
                                    bg-gray-100
                                    border border-gray-200
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icons.CheckCircle
                                        className="
                                            w-5
                                            h-5
                                            text-purple-700
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            text-gray-700
                                        "
                                    >
                                        Class Levels
                                    </span>

                                </div>


                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {classLevels.length}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ACADEMIC YEARS SHORTCUT
                ================================================= */}

                <div
                    className="
                        mt-6
                        rounded-2xl
                        bg-purple-800
                        border border-purple-900
                        p-5
                        text-white
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-4
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <Icons.Calendar
                                    className="w-5 h-5"
                                />

                                <h2
                                    className="
                                        font-semibold
                                    "
                                >
                                    Academic Year Management
                                </h2>

                            </div>


                            <p
                                className="
                                    text-sm
                                    text-purple-200
                                    mt-1
                                "
                            >
                                Set the current academic year,
                                configure dates and manage
                                previous and upcoming years.
                            </p>

                        </div>


                        <Link
                            to="/academics/years"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-5
                                py-2.5
                                rounded-xl
                                bg-white
                                text-purple-800
                                font-semibold
                                text-sm
                                hover:bg-purple-50
                                transition
                            "
                        >

                            Manage Academic Years

                            <Icons.ArrowRight
                                className="w-4 h-4"
                            />

                        </Link>

                    </div>

                </div>

            </main>

        </div>
    );
};


export default AcademicsDashboard;

