import React, { useState, useEffect,  } from "react";
import { ChevronDown, Search, BookOpen, Users, Clock } from "lucide-react";
import { FiUser } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  useEffect(() => {
    // Get token from localStorage
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
    if ( !department) return;
    setSearchTerm("")
    setSearchType("")

    
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/getTeachersByDept?";
      
        if (searchTerm.trim()) {
          url += `search=${encodeURIComponent(searchTerm)}`;
        }
        
      if (department) {
        url += `${searchTerm.trim() ? "&" : ""}department=${encodeURIComponent(department)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.teachers || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/";
      
      switch (searchType) {
        case "specialization":
          url += `searchBySpecialization?q=${encodeURIComponent(searchTerm)}`;
          break;
        case "paper":
          url += `searchByPaper?q=${encodeURIComponent(searchTerm)}`;
          break;
        case "availability":
          url += `searchByAvailability?date=${encodeURIComponent(searchTerm)}`;
          break;
        default:
          url += `getTeachers?search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (department) {
        url += `&department=${encodeURIComponent(department)}`;
      }
      
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
    handleSearch();
  }, [department]);
  useEffect(() => {
    handleSpecialSearch();
  }, [searchTerm, searchType]);

  const handleBookSlot = async (teacherId, slotId) => {
    if (!token) {
      alert("Please login to book a slot");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/slotsRoutes/bookSlots", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify({ 
          teacherId, 
          slotId,
          studentId
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Slot booked successfully!");
        setSelectedTeacher(null);
        
        // Refresh search results
        if (searchType === "general") {
          handleSearch();
        } else {
          handleSpecialSearch(searchType);
        }
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
  const handleogout=()=>{
    localStorage.removeItem("auth-token")
    navigate("/login")
  }

  return (
    <section className="w-full min-h-screen bg-slate-50 flex flex-col selection:bg-cyan-100 selection:text-cyan-900 font-sans">
      <header className="w-full flex justify-between items-center px-6 sm:px-8 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full shadow-md">
            <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{userName}</span>
        </div>
        <button onClick={handleogout} className="px-5 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-slate-800 transition-all duration-200 shadow-md transform hover:-translate-y-0.5">Logout</button>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-20 w-full relative">
        <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-cyan-100/40 to-transparent pointer-events-none -z-10"></div>
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 font-medium">Find and book appointments with your professors instantly.</p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
              type="text"
              placeholder="Search by name, specialization, or papers..."
              value={searchTerm}
              onChange={(e) =>{ setSearchTerm(e.target.value);
                handleSpecialSearch()
              }}
              className="w-full pl-14 pr-4 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-sm text-base md:text-lg"
            />
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setSearchType("specialization");
                handleSpecialSearch("specialization");
              }}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                searchType === "specialization" 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users size={18} /> By Specialization
            </button>
            <button
              onClick={() => {
                setSearchType("paper");
                handleSpecialSearch("paper");
              }}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                searchType === "paper" 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen size={18} /> By Research Paper
            </button>
            <button
              onClick={() => {
                setSearchType("availability");
                handleSpecialSearch("availability");
              }}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                searchType === "availability" 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Clock size={18} /> By Availability
            </button>
          </div>
        </div>

        {/* Department Dropdown */}
        <div className="relative inline-block text-left mt-6">
          <button
            className="inline-flex justify-between items-center w-60 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {department || "Select Department"} <ChevronDown className="ml-2" />
          </button>

          {dropdownOpen && (
            <div className="mt-2 absolute w-60 bg-white rounded-lg shadow-lg z-10">
              {/* <button
                key="all"
                onClick={() => {
                  // handleSearch()
                  setDepartment("");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  department === "" ? "font-semibold text-blue-600" : "text-gray-800"
                }`}
              >
                All Departments
              </button> */}
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setDepartment(dept);
                    console.log("hi")
                    // handleSearch()
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    department === dept ? "font-semibold text-blue-600" : "text-gray-800"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-8 w-full max-w-6xl text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="mt-12 w-full max-w-6xl">
            <div className="mb-8 px-2 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Available Teachers
                {searchType !== "general" && (
                  <span className="text-cyan-600 font-medium text-lg ml-3 block sm:inline">
                    ({searchType === "specialization" ? "By Specialization" : searchType === "paper" ? "By Research Paper" : "By Availability"})
                  </span>
                )}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((prof) => (
                <div
                  key={prof._id}
                  className="group bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-cyan-200 hover:shadow-cyan-100/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full relative overflow-hidden"
                  onClick={() => handleTeacherClick(prof._id)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-50/50 to-indigo-50/50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="flex items-start gap-4 z-10 relative">
                    <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0 transform group-hover:-rotate-3 transition-transform">
                      {prof.firstName?.[0] || "?"}{prof.lastName?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">{prof.firstName} {prof.lastName}</h3>
                      <p className="text-sm font-semibold text-cyan-600 mb-1">{prof.department}</p>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Room {prof.roomNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4 flex-grow z-10 relative">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Specialization</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(prof.specialization) && prof.specialization.length > 0 ? 
                          prof.specialization.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium border border-slate-200">{spec}</span>
                          )) : <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">Not specified</span>
                        }
                        {Array.isArray(prof.specialization) && prof.specialization.length > 3 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium border border-slate-200">+{prof.specialization.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recent Papers</p>
                      <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">
                        {prof.papers && prof.papers.length > 0 ? 
                          prof.papers.map(p => p.title || p).join(" • ") : 
                          "No papers listed"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between z-10 relative">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {prof.slots?.filter(s => s.status === "available").length || 0} Slots
                    </span>
                    <span className="text-sm font-bold text-cyan-600 group-hover:text-cyan-700 transition-colors">Book Now &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && searchTerm && searchResults.length === 0 && (
          <div className="mt-12 w-full max-w-4xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 p-12 text-center border border-white">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">No teachers found</h3>
            <p className="text-slate-500 font-medium">We couldn't find any results matching your search criteria. Try a different keyword.</p>
          </div>
        )}

        {/* Booking Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-cyan-50 to-transparent left-0 -z-0 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="pr-8">
                  <div className="inline-block px-3 py-1 mb-3 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full tracking-wide">
                    {selectedTeacher.department}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight mb-1 flexitems-center gap-2">
                    Book Meeting with
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </span>
                  </h2>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Room {selectedTeacher.roomNumber}
                  </p>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                  onClick={() => setSelectedTeacher(null)}
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
              
              <div className="relative z-10">
                {selectedTeacher.slots?.filter(s => s.status === "available").length > 0 ? (
                  <>
                    <p className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">Select Available Slot</p>
                    <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTeacher.slots
                          .filter(s => s.status === "available")
                          .map((slot, i) => {
                            const slotDate = new Date(slot.time);
                            return (
                              <button 
                                key={i} 
                                className="group p-4 border border-slate-200 rounded-2xl text-left hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={() => handleBookSlot(selectedTeacher._id, slot._id)}
                              >
                                <div className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                                  {slotDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
                                  <Clock size={14} className="text-cyan-500" />
                                  {slotDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-4">
                    <Clock size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No available slots at the moment.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end relative z-10">
                <button
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                  onClick={() => setSelectedTeacher(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default Hero;