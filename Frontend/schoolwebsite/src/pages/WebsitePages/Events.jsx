import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "../../components/ui/EventCard";
import axiosInstance from "../../utils/axiosInstance";

function Events() {
  const [events, setEvents] = useState([]);

  // Fetch events from backend on page load
  useEffect(() => {
    axiosInstance
      .get("/events/")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Upcoming Events
      </h2>

      <div className="max-w-4xl mx-auto">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              description={event.description}
            />
          ))
        ) : (
          <p className="text-center text-gray-600">No events available.</p>
        )}
      </div>
    </div>
  );
}

export default Events;
