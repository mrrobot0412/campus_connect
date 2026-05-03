import React, { useState, useEffect } from "react";
import { ChevronDown, Search, BookOpen, Users, Clock, Mail } from "lucide-react";
import { FiUser } from "react-icons/fi";

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

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    if (storedToken) {
      setToken(storedToken);
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedToken = localStorage.getItem("auth-token");
      if (!storedToken) return;
      
      const response = await fetch("http://localhost:8000/api/v1/loginRoutes/student/profile", {
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

  const handleSearch = async () => {
    if (!searchTerm.trim() && !department) return;
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/getTeachers?";
      if (searchTerm.trim()) url += `search=${encodeURIComponent(searchTerm)}`;
      if (department) url += `${searchTerm.trim() ? "&" : ""}department=${encodeURIComponent(department)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.teachers || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialSearch = async (type) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/";
      switch (type) {
        case "specialization": url += `searchBySpecialization?q=${encodeURIComponent(searchTerm)}`; break;
        case "paper": url += `searchByPaper?q=${encodeURIComponent(searchTerm)}`; break;
        case "availability": url += `searchByAvailability?date=${encodeURIComponent(searchTerm)}`; break;
        default: url += `getTeachers?search=${encodeURIComponent(searchTerm)}`;
      }
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

  const handleBookSlot = async (teacherId, slotId) => {
    if (!token) {
      alert("Please login to book a slot");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/v1/slots/bookSlots", {
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
        if (searchType === "general") handleSearch();
        else handleSpecialSearch(searchType);
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
      const res = await fetch(`http://localhost:8000/api/v1/teachersRoutes/getTeacher/${teacherId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedTeacher(data.teacher);
      } else {
        alert(data.error || "Failed to load teacher details");
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      alert("Failed to load teacher details. Please try again.");
    }
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
            <span className="text-xs text-slate-500 font-medium">Student Dashboard</span>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:text-red-600 transition-colors shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          Sign out
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-20 w-full relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
        
        <div className="text-center space-y-3 mb-10 mt-6 shrink-0">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Find Your Mentor</h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto px-4">Search by name, specialization, or availability to book your next guidance session.</p>
        </div>

        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search for teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => {
                setSearchType("general");
                handleSearch();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
            >
              Search
            </button>
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2.5 justify-center sm:justify-start">
            <button
              onClick={() => {
                setSearchType("specialization");
                handleSpecialSearch("specialization");
              }}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "specialization" 
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users size={16} /> By Specialization
            </button>
            <button
              onClick={() => {
                setSearchType("paper");
                handleSpecialSearch("paper");
              }}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "paper" 
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen size={16} /> By Publication
            </button>
            <button
              onClick={() => {
                setSearchType("availability");
                handleSpecialSearch("availability");
              }}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                searchType === "availability" 
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Clock size={16} /> By Availability
            </button>
          </div>
        </div>

        <div className="relative inline-block text-left mt-8 w-full max-w-4xl flex justify-end shrink-0 z-20">
          <button
            className="inline-flex justify-between items-center w-full sm:w-64 px-5 py-3.5 bg-white text-slate-700 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {department || "All Departments"} <ChevronDown className="ml-2 text-slate-400" size={18} />
          </button>

          {dropdownOpen && (
            <div className="mt-2 absolute right-0 w-full sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 overflow-hidden py-2">
              <button
                key="all"
                onClick={() => {
                  setDepartment("");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                  department === "" ? "bg-indigo-50/50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setDepartment(dept);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                    department === dept ? "bg-indigo-50/50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-16 w-full max-w-4xl text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-wide">Searching mentors...</p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="mt-8 w-full max-w-6xl shrink-0 z-10">
            <h2 className="text-xl font-bold text-slate-800 mb-6 drop-shadow-sm flex items-center gap-2">
              Found {searchResults.length} {searchResults.length === 1 ? 'Mentor' : 'Mentors'} 
              {searchType !== "general" && <span className="text-slate-400 font-medium text-lg">&bull; {searchType === "specialization" ? "Specialization Match" : searchType === "paper" ? "Publication Match" : "Availability Match"}</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((prof) => (
                <div
                  key={prof._id}
                  className="group bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => handleTeacherClick(prof._id)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold text-xl shadow-inner border border-indigo-100/50">
                      {prof.firstName?.[0] || "?"}{prof.lastName?.[0] || "?"}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{prof.firstName} {prof.lastName}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">{prof.department}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 py-1 flex justify-center text-slate-400"><Mail size={16} /></div>
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
                    <span className="text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">Book <span className="text-lg leading-none">&rarr;</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && searchTerm && searchResults.length === 0 && (
          <div className="mt-16 w-full max-w-2xl bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500 font-medium tracking-wide">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {selectedTeacher && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] w-full max-w-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50/50 to-white z-0 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-inner">
                      {selectedTeacher.firstName?.[0]}{selectedTeacher.lastName?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {selectedTeacher.firstName} {selectedTeacher.lastName}
                      </h2>
                      <p className="text-slate-500 font-medium text-sm mt-0.5">{selectedTeacher.department} &bull; Room {selectedTeacher.roomNumber}</p>
                      <p className="text-slate-500 font-medium text-sm mt-0.5 flex items-center gap-1.5"><Mail size={14}/> {selectedTeacher.email}</p>
                    </div>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    &times;
                  </button>
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Users size={14}/> Area of Expertise</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {Array.isArray(selectedTeacher.specialization) ? selectedTeacher.specialization.join(", ") : "General"}
                  </p>
                </div>
                
                {selectedTeacher.slots?.filter(s => s.status === "available").length > 0 ? (
                  <>
                    <h3 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Open Slots
                    </h3>
                    <div className="max-h-[240px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedTeacher.slots
                          .filter(s => s.status === "available")
                          .map((slot, i) => {
                            const slotDate = new Date(slot.time);
                            return (
                              <button 
                                key={i} 
                                className="group relative p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-500 hover:bg-indigo-50/20 hover:shadow-md transition-all flex flex-col items-start overflow-hidden"
                                onClick={() => handleBookSlot(selectedTeacher._id, slot._id)}
                              >
                                <div className="font-bold text-slate-900 text-sm">{slotDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
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
                    <p className="text-slate-600 font-medium">No available slots at the moment.</p>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default Hero;