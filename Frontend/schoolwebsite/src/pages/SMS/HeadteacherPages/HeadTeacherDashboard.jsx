import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Users, Wallet, TrendingUp } from "lucide-react";

export default function HeadTeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("authData");
    const token = stored ? JSON.parse(stored).access : null;

    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/headteacher/dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!data) return null;

  const { hero, student_stats, fee_stats } = data;

  return (
    <div className="p-6 space-y-8">
      {/* --- HERO SECTION --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              {hero.recent_students.length ? (
                <ul className="text-sm space-y-1">
                  {hero.recent_students.map((s) => (
                    <li key={s.id}>
                      {s.first_name} {s.surname} – Grade {s.grade}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent students</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              {hero.recent_teachers.length ? (
                <ul className="text-sm space-y-1">
                  {hero.recent_teachers.map((t) => (
                    <li key={t.id}>
                      {t.first_name} {t.surname}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent teachers</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {hero.recent_inventory_removed.length ? (
                <ul className="text-sm space-y-1">
                  {hero.recent_inventory_removed.map((item, idx) => (
                    <li key={idx}>{item.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent removals</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Current Term: <strong>{student_stats.current_term_students}</strong></p>
              <p>Previous Term: <strong>{student_stats.previous_term_students}</strong></p>
              <p className="flex items-center gap-2">
                Growth: <strong>{student_stats.growth}%</strong>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" /> Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Expected: <strong>KES {fee_stats.expected_fees}</strong></p>
              <p>Collected: <strong>KES {fee_stats.collected_fees}</strong></p>
              <p>Outstanding: <strong>KES {fee_stats.outstanding_balance}</strong></p>
              <p>Collection Rate: <strong>{fee_stats.collection_rate}%</strong></p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
