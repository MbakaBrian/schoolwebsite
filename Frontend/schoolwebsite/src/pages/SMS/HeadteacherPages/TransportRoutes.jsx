import React, { useEffect, useState } from "react";
import axios from "axios";

const TransportRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeForm, setRouteForm] = useState({ name: "" });
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [stageForm, setStageForm] = useState({ stage_name: "", fee_amount: "" });
  const [editingStage, setEditingStage] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const res = await axios.get("http://localhost:8000/api/fees/routes/");
    setRoutes(res.data);
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    if (editingRouteId) {
      await axios.put(
        `http://localhost:8000/api/fees/routes/${editingRouteId}/`,
        routeForm
      );
      setEditingRouteId(null);
    } else {
      await axios.post("http://localhost:8000/api/fees/routes/", routeForm);
    }
    setRouteForm({ name: "" });
    setShowRouteForm(false);
    fetchRoutes();
  };

  const handleDeleteRoute = async (id) => {
    await axios.delete(`http://localhost:8000/api/fees/routes/${id}/`);
    fetchRoutes();
  };

  const handleStageSubmit = async (e) => {
    e.preventDefault();
    if (!activeRouteId) return;
    if (editingStage) {
      await axios.put(
        `http://localhost:8000/api/fees/stages/${editingStage.id}/`,
        { ...stageForm, route: activeRouteId }
      );
      setEditingStage(null);
    } else {
      await axios.post("http://localhost:8000/api/fees/stages/", {
        ...stageForm,
        route: activeRouteId,
      });
    }
    setStageForm({ name: "", fee_amount: "" });
    fetchRoutes();
  };

  const handleDeleteStage = async (id) => {
    await axios.delete(`http://localhost:8000/api/stages/${id}/`);
    fetchRoutes();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transport Routes</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          onClick={() => setShowRouteForm(!showRouteForm)}
        >
          {showRouteForm ? "Cancel" : "Add Route"}
        </button>
      </div>

      {/* Add/Edit Route Form */}
      {showRouteForm && (
        <form
          onSubmit={handleRouteSubmit}
          className="bg-white p-4 rounded-lg shadow mb-6"
        >
          <input
            type="text"
            placeholder="Route Name"
            className="border p-2 rounded w-full mb-3"
            value={routeForm.name}
            onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {editingRouteId ? "Update Route" : "Save Route"}
          </button>
        </form>
      )}

      {/* Routes List */}
      {routes.map((route) => (
        <div key={route.id} className="bg-gray-100 p-4 rounded-lg mb-4 shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{route.name}</h3>
            <div className="space-x-2">
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => {
                  setRouteForm({ name: route.name });
                  setEditingRouteId(route.id);
                  setShowRouteForm(true);
                }}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDeleteRoute(route.id)}
              >
                Delete
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setActiveRouteId(activeRouteId === route.id ? null : route.id)}
              >
                {activeRouteId === route.id ? "Hide Stages" : "View Stages"}
              </button>
            </div>
          </div>

          {/* Stages */}
          {activeRouteId === route.id && (
            <div className="mt-4 pl-4 border-l-2 border-blue-300">
              <h4 className="font-medium mb-2">Stages</h4>
              <ul className="space-y-2">
                {route.stages.map((stage) => (
                  <li
                    key={stage.id}
                    className="flex justify-between items-center bg-white p-2 rounded shadow"
                  >
                    <span>
                      {stage.stage_name} - {stage.fee_amount} KES
                    </span>
                    <div className="space-x-2">
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => {
                          setStageForm({ name: stage.name, fee_amount: stage.fee_amount });
                          setEditingStage(stage);
                          setActiveRouteId(route.id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => handleDeleteStage(stage.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add/Edit Stage Form */}
              <form onSubmit={handleStageSubmit} className="mt-4 flex space-x-2">
          <input
                type="text"
                placeholder="Stage Name"
                className="border p-2 rounded w-1/2"
                value={stageForm.stage_name}
                onChange={(e) =>
                    setStageForm({ ...stageForm, stage_name: e.target.value })
                }
                required
                />
                <input
                  type="number"
                  placeholder="Fee Amount"
                  className="border p-2 rounded w-1/2"
                  value={stageForm.fee_amount}
                  onChange={(e) =>
                    setStageForm({ ...stageForm, fee_amount: e.target.value })
                  }
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingStage ? "Update Stage" : "Add Stage"}
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TransportRoutesPage;
