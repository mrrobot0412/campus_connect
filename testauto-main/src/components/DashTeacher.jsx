import React, { useEffect, useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getSlotStatusClass = (status) => {
  switch (status) {
    case "available":
      return "bg-green-200 text-green-800 border-green-300";
    case "booked":
      return "bg-red-200 text-red-800 border-red-300";
    case "completed":
      return "bg-yellow-200 text-yellow-800 border-yellow-300";
    case "busy":
      return "bg-gray-200 text-gray-800 border-gray-300";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

function Timetable({ timetable }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Weekly Schedule
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100 text-left font-medium text-gray-700">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border px-4 py-2 bg-gray-100 text-left font-medium text-gray-700"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({
              length: Math.max(
                ...days.map((d) => (timetable[d] || []).length),
                1
              ),
            }).map((_, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-mono text-sm">
                  {timetable["Monday"]?.[idx]?.time
                    ? new Date(
                        timetable["Monday"][idx].time
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : timetable["Monday"]?.[idx]
                    ? `${timetable["Monday"][idx].start} - ${timetable["Monday"][idx].end}`
                    : ""}
                </td>
                {days.map((day) => {
                  const slot = timetable[day]?.[idx];
                  return (
                    <td
                      key={day}
                      className={`border px-4 py-2 text-sm ${
                        slot ? getSlotStatusClass(slot.status) : "bg-gray-50"
                      }`}
                    >
                      {slot?.status === "busy" ? (
                        <div>
                          <div className="font-medium">{slot.type}</div>
                          <div>{slot.subject}</div>
                        </div>
                      ) : slot ? (
                        slot.status.charAt(0).toUpperCase() +
                        slot.status.slice(1)
                      ) : (
                        "Free"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DashTeacher = () => {
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [newPaper, setNewPaper] = useState({
    title: "",
    journal: "",
    year: "",
  });
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });
  const [editingContact, setEditingContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [editSlotId, setEditSlotId] = useState(null);
  const [editSlotTime, setEditSlotTime] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const token = localStorage.getItem("auth-token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8000/api/v1/teachersRoutes/profile",
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setProfile(data.teacher);
      setAvailableSlots(data.teacher.slots || []);
      setTimetable(data.timetable || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPaper = async (e) => {
    e.preventDefault();
    if (!newPaper.title) return;

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/teachersRoutes/addResearchPaper",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify(newPaper),
        }
      );

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNewPaper({ title: "", journal: "", year: "" });
      } else {
        alert(data.error || "Failed to add research paper");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    if (!newSpecialization) return;
    const special = newSpecialization.split(",");

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/teachersRoutes/addSpecialization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ specialization: special }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNewSpecialization("");
      } else {
        alert(data.error || "Failed to add specialization");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleDeletePaper = async (title) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/teachersRoutes/deleteResearchPaper/${title}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete research paper");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time)
      return alert("Select both date and time");
    const isoTime = `${newSlot.date}T${newSlot.time}:00.000`;
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/slotsRoutes/addSlot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ time: isoTime }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Slot added successfully");
        fetchData();
        setNewSlot({ date: "", time: "" });
      } else {
        alert(data.error || "Failed to add slot");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleEditSlot = (slotId, time) => {
    setEditSlotId(slotId);
    // Convert ISO time string to local date and time for the input fields
    const dateTime = new Date(time);
    setEditSlotTime(
      dateTime.toTimeString().substring(0, 5) // Get only HH:MM part
    );
  };

  const handleUpdateSlot = async () => {
    if (!editSlotTime) return;

    // Create a date object from the current date of the slot
    const currentSlot = availableSlots.find((slot) => slot._id === editSlotId);
    const currentDate = new Date(currentSlot.time);

    // Set the new time while keeping the same date
    const [hours, minutes] = editSlotTime.split(":");
    currentDate.setHours(hours, minutes, 0, 0);

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/slotsRoutes/updateSlot/${editSlotId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ time: currentDate.toISOString() }),
        }
      );

      if (res.ok) {
        alert("Slot updated successfully");
        fetchData();
        setEditSlotId(null);
        setEditSlotTime("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update slot");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/slotsRoutes/deleteSlot/${slotId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      if (res.ok) {
        alert("Slot deleted successfully");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete slot");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleContactChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/teachersRoutes/updateContact",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({
            contact: profile.contact,
            roomNumber: profile.roomNumber,
            email: profile.email,
          }),
        }
      );

      if (res.ok) {
        setEditingContact(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update contact information");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const formatSlotTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">
            Unable to load your profile data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl text-blue-600 font-bold">
                {profile.firstName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-blue-100">{profile.department}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "profile"
                  ? "border-b-2 border-blue-500 text-blue-700"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "slots"
                  ? "border-b-2 border-blue-500 text-blue-700"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("slots")}
            >
              Slots & Schedule
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "research"
                  ? "border-b-2 border-blue-500 text-blue-700"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("research")}
            >
              Research & Publications
            </button>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Contact Information
                  </h2>
                  {editingContact ? (
                    <form className="space-y-4" onSubmit={handleUpdateContact}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="contact"
                          value={profile.contact || ""}
                          onChange={handleContactChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Number
                        </label>
                        <input
                          type="text"
                          name="roomNumber"
                          value={profile.roomNumber || ""}
                          onChange={handleContactChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Your room/cabin number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email || ""}
                          onChange={handleContactChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Your email address"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingContact(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex border-b pb-3">
                        <div className="w-1/3 font-medium text-gray-500">
                          Phone
                        </div>
                        <div className="w-2/3 text-gray-900">
                          {profile.contact || "Not set"}
                        </div>
                      </div>
                      <div className="flex border-b pb-3">
                        <div className="w-1/3 font-medium text-gray-500">
                          Room/Cabin
                        </div>
                        <div className="w-2/3 text-gray-900">
                          {profile.roomNumber || "Not set"}
                        </div>
                      </div>
                      <div className="flex border-b pb-3">
                        <div className="w-1/3 font-medium text-gray-500">
                          Email
                        </div>
                        <div className="w-2/3 text-gray-900">
                          {profile.email || "Not set"}
                        </div>
                      </div>
                      <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => setEditingContact(true)}
                      >
                        Edit Contact Info
                      </button>
                    </div>
                  )}
                </div>

                {/* Specialization */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Specialization
                  </h2>
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.specialization ? (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {profile.specialization}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No specializations added yet
                        </p>
                      )}
                    </div>
                    <form
                      className="flex gap-2"
                      onSubmit={handleAddSpecialization}
                    >
                      <input
                        type="text"
                        placeholder="Add specialization"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Slots & Schedule Tab */}
            {activeTab === "slots" && (
              <div className="space-y-8">
                {/* Timetable */}
                <Timetable timetable={timetable} />

                {/* Available Slots Management */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Available Slots
                  </h2>

                  {/* Add New Slot */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3">
                      Add New Slot
                    </h3>
                    <form
                      className="flex flex-wrap gap-3"
                      onSubmit={handleAddSlot}
                    >
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={newSlot.date}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, date: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          value={newSlot.time}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, time: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add Slot
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Edit Slot */}
                  {editSlotId && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-blue-700 mb-3">
                        Edit Slot
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Time
                          </label>
                          <input
                            type="time"
                            value={editSlotTime}
                            onChange={(e) => setEditSlotTime(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <button
                            onClick={handleUpdateSlot}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setEditSlotId(null);
                              setEditSlotTime("");
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Slots List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <tr key={slot._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatSlotTime(slot.time)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    slot.status === "available"
                                      ? "bg-green-100 text-green-800"
                                      : slot.status === "booked"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {slot.status
                                    ? slot.status.charAt(0).toUpperCase() +
                                      slot.status.slice(1)
                                    : "Available"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleEditSlot(slot._id, slot.time)
                                  }
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              No available slots. Add a new slot to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Research Tab */}
            {activeTab === "research" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Research Papers & Publications
                </h2>

                {/* Add New Paper */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Add New Research Paper
                  </h3>
                  <form className="space-y-3" onSubmit={handleAddPaper}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Paper Title"
                        value={newPaper.title}
                        onChange={(e) =>
                          setNewPaper({ ...newPaper, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Journal
                      </label>
                      <input
                        type="text"
                        placeholder="Journal or Conference"
                        value={newPaper.journal}
                        onChange={(e) =>
                          setNewPaper({ ...newPaper, journal: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Paper
                    </button>
                  </form>
                </div>

                {/* Papers List */}
                <div className="space-y-4">
                  {profile.papers && profile.papers.length > 0 ? (
                    profile.papers.map((paper, idx) => (
                      <div
                        key={idx}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {paper.title}
                            </h4>
                            <div className="text-sm text-gray-500">
                              {paper.journal && <span>{paper.journal} </span>}
                              {/* {paper.year && <span>({paper.year})</span>} */}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePaper(paper.title)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No research papers added yet. Add your publications above.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashTeacher;
