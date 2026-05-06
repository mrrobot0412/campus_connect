import React, { useEffect, useState } from "react";
import { Users, BookOpen, Clock, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getSlotStatusClass = (status) => {
  switch (status) {
    case "available":
      return "bg-green-50 text-green-700 border-green-200";
    case "booked":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "completed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "busy":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

function Timetable({ timetable }) {
  return (
    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 sm:p-8">
      <h3 className="text-xl font-bold mb-6 text-slate-900 tracking-tight">
        Weekly Schedule
      </h3>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border-l border-slate-200/80 px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({
                length: Math.max(
                  ...days.map((d) => (timetable[d] || []).length),
                  1
                ),
              }).map((_, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap">
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
                        className="border-l border-slate-100 px-3 py-3"
                      >
                        {slot ? (
                          <div className={`px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-sm ${getSlotStatusClass(slot.status)}`}>
                            {slot.status === "busy" ? (
                              <div>
                                <div className="font-bold">{slot.type}</div>
                                <div className="text-xs opacity-80 mt-0.5">{slot.subject}</div>
                              </div>
                            ) : (
                              slot.status.charAt(0).toUpperCase() + slot.status.slice(1)
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm font-medium px-2">—</span>
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
    </div>
  );
}

const DashTeacher = () => {
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [newPaper, setNewPaper] = useState({ title: "", journal: "", year: "" });
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });
  const [editingContact, setEditingContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [editSlotId, setEditSlotId] = useState(null);
  const [editSlotTime, setEditSlotTime] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const token = localStorage.getItem("auth-token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/profile`, {
        headers: { "auth-token": token, "Content-Type": "application/json" },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-role");
        navigate("/login");
        return;
      }
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
    const role = localStorage.getItem("user-role");
    // Keep students out of the teacher dashboard UI.
    if (role === "student") {
      navigate("/dash");
      return;
    }
    fetchData();
  }, [navigate]);

  const handleAddPaper = async (e) => {
    e.preventDefault();
    if (!newPaper.title) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/addResearchPaper`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify(newPaper),
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNewPaper({ title: "", journal: "", year: "" });
      } else alert(data.error || "Failed to add research paper");
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
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/addSpecialization`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({ specialization: special }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNewSpecialization("");
      } else alert(data.error || "Failed to add specialization");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleDeletePaper = async (title) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/deleteResearchPaper/${encodeURIComponent(title)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "auth-token": token },
      });
      if (res.ok) fetchData();
      else {
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
    if (!newSlot.date || !newSlot.time) return alert("Select both date and time");
    const isoTime = `${newSlot.date}T${newSlot.time}:00.000`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/slots/addSlot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({ time: isoTime }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Slot added successfully");
        fetchData();
        setNewSlot({ date: "", time: "" });
      } else alert(data.error || "Failed to add slot");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleEditSlot = (slotId, time) => {
    setEditSlotId(slotId);
    const dateTime = new Date(time);
    setEditSlotTime(dateTime.toTimeString().substring(0, 5));
  };

  const handleUpdateSlot = async () => {
    if (!editSlotTime) return;
    const currentSlot = availableSlots.find((slot) => slot._id === editSlotId);
    const currentDate = new Date(currentSlot.time);
    const [hours, minutes] = editSlotTime.split(":");
    currentDate.setHours(hours, minutes, 0, 0);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/slots/updateSlot/${editSlotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({ time: currentDate.toISOString() }),
      });
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
      const res = await fetch(`${API_BASE_URL}/api/v1/slots/deleteSlot/${slotId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "auth-token": token },
      });
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
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/updateContact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({
          phone: profile.phone,
          showPhone: profile.showPhone,
          roomNumber: profile.roomNumber,
          email: profile.email,
        }),
      });
      if (res.ok) {
        setEditingContact(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update contact info");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const formatSlotTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6 shadow-sm"></div>
          <p className="text-lg font-bold text-slate-800 tracking-tight">Loading Workspace...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">Connection Error</h2>
          <p className="text-slate-500 font-medium mb-8">Unable to load your profile data securely. Please try refreshing.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg hover:-translate-y-1"
          >
            Refresh Session
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Campus Connect</h1>
        </div>
        <button onClick={() => { localStorage.removeItem("auth-token"); localStorage.removeItem("user-role"); window.location.href='/login' }} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm">
          Sign Out
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Profile Card */}
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl shadow-indigo-900/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl"></div>
          <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-5xl text-indigo-600 font-black shadow-inner border border-white/50 shrink-0 transform rotate-3">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-indigo-200 text-lg font-medium flex items-center justify-center sm:justify-start gap-2">
                <Settings size={18} /> {profile.department} Faculty
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-8 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          {[
            { id: "profile", icon: User, label: "Overview" },
            { id: "slots", icon: Clock, label: "Schedule" },
            { id: "research", icon: BookOpen, label: "Research" },
            { id: "appointments", icon: Users, label: "Appointments" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "profile" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
                <h2 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <User className="text-indigo-500" /> Contact Details
                </h2>
                {editingContact ? (
                  <form className="space-y-5" onSubmit={handleUpdateContact}>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                      <input type="text" name="phone" value={profile.phone || ""} onChange={handleContactChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-900 transition-all" placeholder="+91..." />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <input 
                        type="checkbox" 
                        id="showPhone" 
                        name="showPhone" 
                        checked={profile.showPhone || false} 
                        onChange={(e) => setProfile({ ...profile, showPhone: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="showPhone" className="text-sm font-bold text-slate-700 cursor-pointer">Show phone number to students</label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Room / Cabin</label>
                      <input type="text" name="roomNumber" value={profile.roomNumber || ""} onChange={handleContactChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-900 transition-all"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input type="email" name="email" value={profile.email || ""} onChange={handleContactChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-900 transition-all"/>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md">Save Changes</button>
                      <button type="button" onClick={() => setEditingContact(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-slate-100 group">
                      <div className="w-1/3 font-bold text-slate-400 text-sm tracking-wide uppercase">Phone</div>
                      <div className="w-2/3 flex items-center gap-2">
                        <span className="text-slate-900 font-semibold text-lg">{profile.phone || "—"}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${profile.showPhone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {profile.showPhone ? 'Public' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-slate-100">
                      <div className="w-1/3 font-bold text-slate-400 text-sm tracking-wide uppercase">Workspace</div>
                      <div className="w-2/3 text-slate-900 font-semibold text-lg">{profile.roomNumber || "—"}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-slate-100">
                      <div className="w-1/3 font-bold text-slate-400 text-sm tracking-wide uppercase">Email</div>
                      <div className="w-2/3 text-slate-900 font-semibold text-lg">{profile.email || "—"}</div>
                    </div>
                    <button onClick={() => setEditingContact(true)} className="mt-2 px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all">Update Information</button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
                <h2 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <Settings className="text-indigo-500" /> Specializations
                </h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.specialization && profile.specialization.length > 0 ? (
                    Array.isArray(profile.specialization) ? profile.specialization.map((spec, i) => (
                      <span key={i} className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">{spec}</span>
                    )) : <span className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">{profile.specialization}</span>
                  ) : <p className="text-slate-400 font-medium italic bg-slate-50 w-full p-4 rounded-xl text-center border border-dashed border-slate-200">No areas added yet</p>}
                </div>
                <form className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100" onSubmit={handleAddSpecialization}>
                  <input type="text" placeholder="E.g. Machine Learning, NLP" value={newSpecialization} onChange={(e) => setNewSpecialization(e.target.value)} className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all shadow-sm"/>
                  <button type="submit" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-md">Add Area</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-8">
              <Timetable timetable={timetable} />
              
              <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
                <h2 className="text-xl font-bold mb-8 text-slate-900">Manage Availability</h2>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 mb-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-indigo-500" /> Offer New Slot</h3>
                  <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleAddSlot}>
                    <div className="w-full sm:flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date</label>
                      <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" required />
                    </div>
                    <div className="w-full sm:flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Time</label>
                      <input type="time" value={newSlot.time} onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" required />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">Create</button>
                  </form>
                </div>

                {editSlotId && (
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">Reschedule Slot</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="w-full sm:flex-1">
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">New Time</label>
                        <input type="time" value={editSlotTime} onChange={(e) => setEditSlotTime(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 font-bold text-indigo-900" />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handleUpdateSlot} className="flex-1 sm:flex-none px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">Confirm</button>
                        <button onClick={() => { setEditSlotId(null); setEditSlotTime(""); }} className="flex-1 sm:flex-none px-6 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {availableSlots.length > 0 ? availableSlots.map((slot) => (
                        <tr key={slot._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-900">{formatSlotTime(slot.time)}</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border shadow-sm ${slot.status === "available" ? "bg-green-50 text-green-700 border-green-200" : slot.status === "booked" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {slot.status ? slot.status.charAt(0).toUpperCase() + slot.status.slice(1) : "Available"}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold">
                            <button onClick={() => handleEditSlot(slot._id, slot.time)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100">Reschedule</button>
                            <button onClick={() => handleDeleteSlot(slot._id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">Remove</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-sm font-medium text-slate-500 bg-slate-50/50">Your schedule is empty. Add slots above!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "research" && (
            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
              <h2 className="text-xl font-bold mb-8 text-slate-900 flex items-center gap-2"><BookOpen className="text-indigo-500"/> Published Works</h2>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 mb-8">
                <h3 className="font-bold text-slate-800 mb-4">Add Publication</h3>
                <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleAddPaper}>
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Title</label>
                    <input type="text" value={newPaper.title} onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="e.g. Attention is All You Need" required />
                  </div>
                  <div className="w-full sm:flex-[0.6]">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Journal / Conf</label>
                    <input type="text" value={newPaper.journal} onChange={(e) => setNewPaper({ ...newPaper, journal: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="e.g. NeurIPS" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-md">Add Record</button>
                </form>
              </div>

              <div className="grid gap-4">
                {profile.papers && profile.papers.length > 0 ? profile.papers.map((paper, idx) => (
                  <div key={idx} className="group p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all flex justify-between items-start cursor-default">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">{paper.title}</h4>
                      {paper.journal && <span className="inline-block mt-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100">{paper.journal}</span>}
                    </div>
                    <button onClick={() => handleDeletePaper(paper.title)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">&times;</button>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium">No publications added.</div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "appointments" && (
            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
              <h2 className="text-xl font-bold mb-8 text-slate-900 flex items-center gap-2"><Users className="text-indigo-500"/> Scheduled Sessions</h2>
              
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {availableSlots.filter(s => s.status === "booked" && s.student).length > 0 ? availableSlots.filter(s => s.status === "booked" && s.student).map((slot) => (
                      <tr key={slot._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{formatSlotTime(slot.time)}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">{slot.student.firstName?.[0]}{slot.student.lastName?.[0]}</div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{slot.student.firstName} {slot.student.lastName}</div>
                              <div className="text-xs font-medium text-slate-500">{slot.student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-500 font-mono">
                          {slot.student.roll}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <button onClick={() => handleDeleteSlot(slot._id)} className="text-red-700 font-bold hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition-all shadow-sm focus:ring-4 focus:ring-red-100">Cancel</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">Your calendar is currently clear.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashTeacher;
