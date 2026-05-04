import React, { useState, useEffect } from "react";
import { ChevronDown, Search, BookOpen, Users, Clock, Mail } from "lucide-react";
import { FiUser } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const departments = ["CSED", "ECED"];

const Hero = () => {
  const [department, setDepartment] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchType, setSearchType] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showAppointments, setShowAppointments] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const navigate = useNavigate();

  const fetchMyAppointments = async () => {
    try {
      const storedToken = localStorage.getItem("auth-token");
      if (!storedToken) return;
      const response = await fetch(`${API_BASE_URL}/api/v1/slotsRoutes/retriveSlots`, {
        headers: { "auth-token": storedToken }
      });
      if (response.ok) {
        const data = await response.json();
        setMyAppointments(data.bookedSlots || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    if (storedToken) {
      setToken(storedToken);
    }
    fetchUserData();
    fetchMyAppointments();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedToken = localStorage.getItem("auth-token");
      if (!storedToken) return;
      
      const response = await fetch(`${API_BASE_URL}/api/v1/loginRoutes/student/profile`, {
        headers: {
          "auth-token": storedToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserName(data.student?.firstName || "Guest");
        setStudentId(data.student?._id || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("Guest");
    }
  };

  const handleSearch = async (overrideType) => {
    // Determine the type to use: either the one passed in (when clicking a button) or the state
    const currentType = overrideType || searchType;
    
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/teachersRoutes/getTeachers?type=${currentType}`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (department) url += `&department=${encodeURIComponent(department)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.teachers || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search while typing
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, department, searchType]);

  // Handle typing without resetting the filter type
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBookSlot = async (teacherId, slotId) => {
    if (!token) {
      alert("Please login to book a slot");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/slotsRoutes/bookSlots`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify({ teacherId, slotId, studentId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Slot booked successfully!");
        setSelectedTeacher(null);
        handleSearch(); // Refresh current view
        fetchMyAppointments();
      } else {
        alert(data.error || "Failed to book slot");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book slot. Please try again.");
    }
  };

  const handleTeacherClick = async (teacherId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/teachersRoutes/getTeacher/${teacherId}`);
      const data = await res.json();
      if (res.ok) setSelectedTeacher(data.teacher);
      else alert(data.error || "Failed to load teacher details");
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      alert("Failed to load teacher details. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    navigate("/login");
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full ring-4 ring-indigo-50/50">
            <FiUser className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">{userName}</span>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Student View</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchMyAppointments(); setShowAppointments(true); }} 
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          >
            My Appointments
          </button>
          <button 
            onClick={handleLogout} 
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-md transform hover:-translate-y-0.5"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-20 w-full relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
        
        <div className="text-center space-y-3 mb-10 mt-6 shrink-0">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Find Your Mentor</h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto px-4">Search by name, specialization, or availability to book your next guidance session.</p>
        </div>

        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search teachers, subjects, specializations..."
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full pl-14 pr-4 py-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            
            <button
              onClick={() => handleSearch()}
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
            >
              Search Now
            </button>
            
            <div className="relative inline-block text-left w-full sm:w-auto shrink-0">
              <button
                className="inline-flex justify-between items-center w-full sm:w-48 px-5 py-4 bg-white text-slate-700 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {department || "Department"} <ChevronDown className="ml-2 text-slate-400" size={18} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => { setDepartment(""); setDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${department === "" ? "bg-indigo-50/50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 font-medium"}`}
                  >
                    All Departments
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => { setDepartment(dept); setDropdownOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-sm transition-colors ${department === dept ? "bg-indigo-50/50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 font-medium"}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2.5 justify-center sm:justify-start">
            <button
              onClick={() => setSearchType("specialization")}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "specialization" ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users size={16} /> By Specialization
            </button>
            <button
              onClick={() => setSearchType("paper")}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "paper" ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen size={16} /> By Publication
            </button>
            <button
              onClick={() => setSearchType("availability")}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "availability" ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Clock size={16} /> By Availability
            </button>
            {searchType !== "general" && (
              <button
                onClick={() => setSearchType("general")}
                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="mt-16 w-full max-w-4xl text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
            <p className="mt-4 text-slate-500 font-bold tracking-wide">Searching mentors...</p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="mt-12 w-full max-w-6xl shrink-0 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex items-center gap-3 px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Mentors</h2>
              <span className="bg-slate-200/60 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                {searchResults.length} {searchResults.length === 1 ? 'Found' : 'Matches'}
              </span>
              {searchType !== "general" && searchType !== "" && (
                <span className="text-slate-400 font-medium text-sm border-l border-slate-300 pl-3">
                  Filtering by {searchType}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((prof) => (
                <div
                  key={prof._id}
                  className="group bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => handleTeacherClick(prof._id)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold text-xl shadow-inner border border-indigo-100/50 transform group-hover:-rotate-3 transition-transform duration-300">
                      {prof.firstName?.[0] || "?"}{prof.lastName?.[0] || "?"}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{prof.firstName} {prof.lastName}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">{prof.department} Department</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 flex justify-center text-slate-400"><Mail size={16} /></div>
                      <p className="text-sm text-slate-700 truncate" title={prof.email}>
                        <span className="font-semibold text-slate-900">Email:</span> {prof.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 flex justify-center text-slate-400"><Users size={16} /></div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">Room:</span> {prof.roomNumber}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 flex justify-center text-slate-400 mt-1"><BookOpen size={16} /></div>
                      <p className="text-sm text-slate-700 leading-relaxed max-w-[90%]">
                        <span className="font-semibold text-slate-900 block mb-0.5">Focus:</span>
                        <span className="line-clamp-2">{Array.isArray(prof.specialization) ? prof.specialization.join(", ") : "Not specified"}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-5 bg-slate-50/50 -mx-6 -mb-6 p-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200/60 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      {(prof.slots?.filter(s => s.status === "available").length || 0)} slots open
                    </span>
                    <span className="text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">View Schedule <span className="text-lg leading-none">&rarr;</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && (searchTerm || department) && searchResults.length === 0 && (
          <div className="mt-16 w-full max-w-2xl bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No matches found</h3>
            <p className="text-slate-500 font-medium tracking-wide">Try adjusting your filters, department, or search terms.</p>
          </div>
        )}

        {/* Schedule Booking Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] w-full max-w-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50/80 to-white z-0 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-inner border border-indigo-200/50">
                      {selectedTeacher.firstName?.[0]}{selectedTeacher.lastName?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedTeacher.firstName} {selectedTeacher.lastName}
                      </h2>
                      <p className="text-slate-500 font-medium text-sm mt-0.5">{selectedTeacher.department} &bull; Room {selectedTeacher.roomNumber}</p>
                      <p className="text-slate-500 font-medium text-sm mt-0.5 flex items-center gap-1.5"><Mail size={14}/> {selectedTeacher.email}</p>
                    </div>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    &times;
                  </button>
                </div>

                <div className="mb-8 p-5 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Users size={14}/> Area of Expertise</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {Array.isArray(selectedTeacher.specialization) ? selectedTeacher.specialization.join(", ") : "General"}
                  </p>
                </div>
                
                {selectedTeacher.slots?.filter(s => s.status === "available").length > 0 ? (
                  <>
                    <h3 className="mb-4 text-sm font-black text-slate-900 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Available Times
                    </h3>
                    <div className="max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedTeacher.slots
                          .filter(s => s.status === "available")
                          .map((slot, i) => {
                            const slotDate = new Date(slot.time);
                            return (
                              <button 
                                key={i} 
                                className="group relative p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-left hover:border-indigo-500 hover:bg-indigo-50/20 hover:shadow-md transition-all flex flex-col items-start overflow-hidden"
                                onClick={() => handleBookSlot(selectedTeacher._id, slot._id)}
                              >
                                <div className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-900 transition-colors">{slotDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                <div className="text-sm font-semibold text-indigo-600 mt-1">{slotDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-bold">No available slots.</p>
                    <p className="text-slate-400 text-sm font-medium mt-1">This mentor's schedule is full.</p>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Appointments Management Modal */}
        {showAppointments && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative overflow-hidden border border-white">
              <div className="absolute top-0 w-full h-40 bg-gradient-to-br from-indigo-50 to-transparent left-0 pointer-events-none z-0"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Portfolio</h2>
                  <p className="text-slate-500 font-medium mt-2">Manage your scheduled one-on-ones with mentors.</p>
                </div>
                <button onClick={() => setShowAppointments(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors shadow-sm">
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar relative z-10 flex-grow">
                {myAppointments.filter(app => app.status === "booked").length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myAppointments.filter(app => app.status === "booked").map((apt, idx) => {
                      const dt = new Date(apt.time);
                      return (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-3xl"></div>
                          
                          <div className="flex justify-between items-start mb-4 pl-3">
                            <div>
                              <div className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block mb-3 border border-indigo-100/50 tracking-wide uppercase">{apt.department}</div>
                              <h3 className="text-xl font-black text-slate-900">Dr. {apt.firstName} {apt.lastName}</h3>
                              <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Office {apt.roomNumber}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 ml-3 mt-5">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                              <Clock size={18} className="text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-slate-500 font-bold mt-0.5">
                                {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-5 ml-3 flex justify-end">
                            <button 
                              onClick={async () => {
                                if(window.confirm("Are you sure you want to cancel this appointment?")) {
                                  try {
                                    const res = await fetch(`${API_BASE_URL}/api/v1/slotsRoutes/cancelSlot`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json", "auth-token": token },
                                      body: JSON.stringify({ teacherId: apt.teacherId, slotId: apt.slotId })
                                    });
                                    if(res.ok) {
                                      alert("Appointment canceled");
                                      fetchMyAppointments();
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl transition-all border border-red-100 shadow-sm"
                            >
                              Cancel Meeting
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-5 border border-slate-100">
                      <BookOpen size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No Upcoming Meetings</h3>
                    <p className="text-slate-500 font-medium tracking-wide">You don't have any appointments booked with mentors.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default Hero;