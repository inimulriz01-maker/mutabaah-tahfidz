import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseConfig } from './supabase';
import { buildSupabasePayload, deserializeSupabaseRow, filterRiwayatRows, mergeRowsWithLatestState } from './supabasePayloads';
import { formatDateDisplay, formatDateLocal, getHariByTanggal, getInitialHari, getTanggalByHari, getTodayDateStr } from './dateUtils';

export default function App() {
  const repairedRiwayatIdsRef = useRef(new Set());

  const dataHalaqoh = {
    "Halaqoh Tsuroyya": [
      "Isa Abdullah",
      "Muhammad Hamadah",
      "Athar Athaillah Benafia",
      "Ibadur Rahman Zega",
      "Eshan Farras Saputra",
      "Fadhil Bukkar",
      "Zhafir Shankara Al Ghani Mulawarman",
      "Muhammad Fakhry Abdullah",
      "Muhammad Fadhil Ardinata",
      "Darryl Rafardhan Athalla",
      "Dzikri Mahardika Ramadhan",
      "Fathir Ahza Hariman",
      "Gerald Gibran Al-Ghifari",
      "Rayhan Zainul Ammar"
    ],
    "Halaqoh Abror": [
      "Nabhan Fahesh Zavier",
      "Muhammad Farras Sa'dan",
      "Abdullah El Hakim Gozali",
      "Zahran Hanif Purnama",
      "M. Aldan Faturrahman",
      "Gahthan",
      "Nadhif Farras Zaidan",
      "Fazian Yazdan Iyazi",
      "Raynell Adhara Nuvi",
      "Darren Faraz Akbar",
      "Al Ghifari Tanzil Aziz",
      "Dzakwan Dzakir"
    ],
    "Halaqoh Zanjabila": [
      "Fathan Azky Ramadhan",
      "Fakhri Khoiron Kurnia",
      "Jamil",
      "Bastian Ibrahim",
      "Azzam Ds",
      "Ibnu Mujahid",
      "Raydel Adha Annuvi",
      "Hudzaifah",
      "Gaisan Attarij",
      "Ibnu Sina",
      "Muhamad Alif Alkautsar",
      "Hisyam",
      "Ariq",
      "Ranggi Andrian",
      "Syabil"
    ],
    "Halaqoh Dzunnurain": [
      "Jilan Ismi",
      "Salma Azeeza",
      "Hanifa",
      "Nasywa",
      "Ayu Setyowati",
      "Azka Nafisah",
      "Adelia",
      "Alifah Khoirunnisa",
      "Kathya Fatima C"
    ],
    "Halaqoh Akhyar": [
      "Almira Kaltsum Mubarok",
      "Najwa",
      "Ghina Lutfiah Zahirah",
      "Haifa Al Fajr Riaaz Syawal Gibrani",
      "Nafisa Mikaila Faizatul Muslim",
      "Nida Ul Haq",
      "Rasikha Fakhira"
    ]
  };

  const studentDetails = {
    "Isa Abdullah": { nisn: "0125256679", kelas: "Kelas 8", target: "3 Juz" },
    "Muhammad Hamadah": { nisn: "0114246201", kelas: "Kelas 9", target: "3 Juz" },
    "Athar Athaillah Benafia": { nisn: "3123344863", kelas: "Kelas 8", target: "3 Juz" },
    "Ibadur Rahman Zega": { nisn: "0124604656", kelas: "Kelas 8", target: "3 Juz" },
    "Eshan Farras Saputra": { nisn: "0138566040", kelas: "Kelas 7", target: "3 Juz" },
    "Fadhil Bukkar": { nisn: "0133698181", kelas: "Kelas 7", target: "3 Juz" },
    "Zhafir Shankara Al Ghani Mulawarman": { nisn: "3139399132", kelas: "Kelas 7", target: "3 Juz" },
    "Muhammad Fakhry Abdullah": { nisn: "0113745419", kelas: "Kelas 9", target: "3 Juz" },
    "Muhammad Fadhil Ardinata": { nisn: "0122339151", kelas: "Kelas 9", target: "3 Juz" },
    "Darryl Rafardhan Athalla": { nisn: "0125176982", kelas: "Kelas 8", target: "3 Juz" },
    "Dzikri Mahardika Ramadhan": { nisn: "3148219449", kelas: "Kelas 8", target: "3 Juz" },
    "Fathir Ahza Hariman": { nisn: "0131991804", kelas: "Kelas 8", target: "3 Juz" },
    "Gerald Gibran Al-Ghifari": { nisn: "3133417808", kelas: "Kelas 8", target: "3 Juz" },
    "Rayhan Zainul Ammar": { nisn: "0122542392", kelas: "Kelas 8", target: "3 Juz" },

    "Nabhan Fahesh Zavier": { nisn: "0133686763", kelas: "Kelas 7", target: "3 Juz" },
    "Muhammad Farras Sa'dan": { nisn: "0137248021", kelas: "Kelas 7", target: "3 Juz" },
    "Abdullah El Hakim Gozali": { nisn: "3132219890", kelas: "Kelas 7", target: "3 Juz" },
    "Zahran Hanif Purnama": { nisn: "0135068523", kelas: "Kelas 7", target: "3 Juz" },
    "M. Aldan Faturrahman": { nisn: "0149898540", kelas: "Kelas 7", target: "3 Juz" },
    "Gahthan": { nisn: "0136920294", kelas: "Kelas 8", target: "3 Juz" },
    "Nadhif Farras Zaidan": { nisn: "0122704533", kelas: "Kelas 8", target: "3 Juz" },
    "Fazian Yazdan Iyazi": { nisn: "3127745640", kelas: "Kelas 8", target: "3 Juz" },
    "Raynell Adhara Nuvi": { nisn: "0129332872", kelas: "Kelas 8", target: "3 Juz" },
    "Darren Faraz Akbar": { nisn: "0139798290", kelas: "Kelas 8", target: "3 Juz" },
    "Al Ghifari Tanzil Aziz": { nisn: "0117197224", kelas: "Kelas 9", target: "3 Juz" },
    "Dzakwan Dzakir": { nisn: "0119768977", kelas: "Kelas 9", target: "3 Juz" },

    "Fathan Azky Ramadhan": { nisn: "0112741291", kelas: "Kelas 9", target: "3 Juz" },
    "Fakhri Khoiron Kurnia": { nisn: "0128466913", kelas: "Kelas 9", target: "3 Juz" },
    "Jamil": { nisn: "0115731856", kelas: "Kelas 9", target: "3 Juz" },
    "Bastian Ibrahim": { nisn: "0114347493", kelas: "Kelas 9", target: "3 Juz" },
    "Azzam Ds": { nisn: "0124492431", kelas: "Kelas 8", target: "3 Juz" },
    "Ibnu Mujahid": { nisn: "3133661510", kelas: "Kelas 8", target: "3 Juz" },
    "Raydel Adha Annuvi": { nisn: "0129325313", kelas: "Kelas 8", target: "3 Juz" },
    "Hudzaifah": { nisn: "0121327356", kelas: "Kelas 8", target: "3 Juz" },
    "Gaisan Attarij": { nisn: "3136849832", kelas: "Kelas 8", target: "3 Juz" },
    "Ibnu Sina": { nisn: "0137375222", kelas: "Kelas 8", target: "3 Juz" },
    "Muhamad Alif Alkautsar": { nisn: "3121975622", kelas: "Kelas 8", target: "3 Juz" },
    "Hisyam": { nisn: "0135189219", kelas: "Kelas 7", target: "3 Juz" },
    "Ariq": { nisn: "0146426206", kelas: "Kelas 7", target: "3 Juz" },
    "Ranggi Andrian": { nisn: "0136077691", kelas: "Kelas 7", target: "3 Juz" },
    "Syabil": { nisn: "0133495688", kelas: "Kelas 7", target: "3 Juz" },

    "Jilan Ismi": { nisn: "3123684049", kelas: "Kelas 8", target: "3 Juz" },
    "Salma Azeeza": { nisn: "0134541812", kelas: "Kelas 8", target: "3 Juz" },
    "Hanifa": { nisn: "0136015558", kelas: "Kelas 8", target: "3 Juz" },
    "Nasywa": { nisn: "0125469575", kelas: "Kelas 8", target: "3 Juz" },
    "Ayu Setyowati": { nisn: "0127519768", kelas: "Kelas 9", target: "3 Juz" },
    "Azka Nafisah": { nisn: "0114277587", kelas: "Kelas 9", target: "3 Juz" },
    "Adelia": { nisn: "0121945637", kelas: "Kelas 9", target: "3 Juz" },
    "Alifah Khoirunnisa": { nisn: "0118804227", kelas: "Kelas 9", target: "3 Juz" },
    "Kathya Fatima C": { nisn: "0129254488", kelas: "Kelas 9", target: "3 Juz" },

    "Almira Kaltsum Mubarok": { nisn: "0145987521", kelas: "Kelas 7", target: "3 Juz" },
    "Najwa": { nisn: "0134336051", kelas: "Kelas 8", target: "3 Juz" },
    "Ghina Lutfiah Zahirah": { nisn: "0132697519", kelas: "Kelas 8", target: "3 Juz" },
    "Haifa Al Fajr Riaaz Syawal Gibrani": { nisn: "3122904936", kelas: "Kelas 8", target: "3 Juz" },
    "Nafisa Mikaila Faizatul Muslim": { nisn: "0113430490", kelas: "Kelas 9", target: "3 Juz" },
    "Nida Ul Haq": { nisn: "3123415666", kelas: "Kelas 9", target: "3 Juz" },
    "Rasikha Fakhira": { nisn: "3106004954", kelas: "Kelas 9", target: "3 Juz" }
  };

  const guruPengampu = {
    "Halaqoh Tsuroyya": "Ustadz Mulia",
    "Halaqoh Abror": "Ustadz Lutfan",
    "Halaqoh Zanjabila": "Ustadz Eechram",
    "Halaqoh Dzunnurain": "Ustadzah Amel",
    "Halaqoh Akhyar": "Ustadzah Suci"
  };

  const daftarPenguji = [
    "Ustadz Mulia", "Ustadz Lutfan", "Ustadz Eechram", "Ustadzah Amel", "Ustadzah Suci"
  ];

  const jumlahAyatSurah = {
    "Al-Fatihah": 7, "Al-Baqarah": 286, "Ali 'Imran": 200, "An-Nisa'": 176, "Al-Ma'idah": 120, "Al-An'am": 165, "Al-A'raf": 206, "Al-Anfal": 75, "At-Taubah": 129, "Yunus": 109,
    "Hud": 123, "Yusuf": 111, "Ar-Ra'd": 43, "Ibrahim": 52, "Al-Hijr": 99, "An-Nahl": 128, "Al-Isra'": 111, "Al-Kahf": 110, "Maryam": 98, "Ta-Ha": 135,
    "Al-Anbiya'": 112, "Al-Hajj": 78, "Al-Mu'minun": 118, "An-Nur": 64, "Al-Furqan": 77, "Asy-Syu'ara'": 227, "An-Naml": 93, "Al-Qasas": 88, "Al-'Ankabut": 69, "Ar-Rum": 60,
    "Luqman": 34, "As-Sajdah": 30, "Al-Ahzab": 73, "Saba'": 54, "Fatir": 45, "Ya-Sin": 83, "As-Saffat": 182, "Sad": 88, "Az-Zumar": 75, "Gafir": 85,
    "Fussilat": 54, "Asy-Syura": 53, "Az-Zukhruf": 89, "Ad-Dukhan": 59, "Al-Jasiyah": 37, "Al-Ahqaf": 35, "Muhammad": 38, "Al-Fath": 29, "Al-Hujurat": 18, "Qaf": 45,
    "Adz-Dzariyat": 60, "At-Tur": 49, "An-Najm": 62, "Al-Qamar": 55, "Ar-Rahman": 78, "Al-Waqi'ah": 96, "Al-Hadid": 29, "Al-Mujadilah": 22, "Al-Hasyr": 24, "Al-Mumtahanah": 13,
    "As-Saff": 14, "Al-Jumu'ah": 11, "Al-Munafiqun": 11, "At-Tagabun": 18, "At-Talaq": 12, "At-Tahrim": 12, "Al-Mulk": 30, "Al-Qalam": 52, "Al-Haqqah": 52,
    "Al-Ma'arij": 44, "Nuh": 28, "Al-Jinn": 28, "Al-Muzzammil": 20, "Al-Muddassir": 56, "Al-Qiyamah": 40, "Al-Insan": 31, "Al-Mursalat": 50, "An-Naba'": 40, "An-Nazi'at": 46,
    "'Abasa": 42, "At-Takwir": 29, "Al-Infitar": 19, "Al-Mutaffifin": 36, "Al-Insyiqaq": 25, "Al-Buruj": 22, "At-Tariq": 17, "Al-A'la": 19, "Al-Ghasyiyah": 26, "Al-Fajr": 30,
    "Al-Balad": 20, "Asy-Syams": 15, "Al-Lail": 21, "Ad-Duha": 11, "Asy-Syarh": 8, "At-Tin": 8, "Al-'Alaq": 19, "Al-Qadr": 5, "Al-Bayyinah": 8, "Az-Zalzalah": 8,
    "Al-'Adiyat": 11, "Al-Qari'ah": 11, "At-Takasur": 8, "Al-'Asr": 3, "Al-Humazah": 9, "Al-Fil": 5, "Quraisy": 4, "Al-Ma'un": 7, "Al-Kautsar": 3, "Al-Kafirun": 6,
    "An-Nasr": 3, "Al-Lahab": 5, "Al-Ikhlas": 4, "Al-Falaq": 5, "An-Nas": 6
  };

  const daftarSurat = Object.keys(jumlahAyatSurah);

  const jumlahHalamanTamhidi = {
    "Tamhidi Jilid 1": 30,
    "Tamhidi Jilid 2": 30,
    "Tamhidi Jilid 3": 30,
    "Tamhidi Jilid 4": 30,
    "Tamhidi Jilid 5": 30
  };

  const daftarTamhidi = Object.keys(jumlahHalamanTamhidi);

  const daftarJuz = [
    "Juz 30", "Juz 29", "Juz 28", "Juz 27", "Juz 26", "Juz 25", "Juz 24", "Juz 23", "Juz 22", "Juz 21",
    "Juz 20", "Juz 19", "Juz 18", "Juz 17", "Juz 16", "Juz 15", "Juz 14", "Juz 13", "Juz 12", "Juz 11",
    "Juz 10", "Juz 9", "Juz 8", "Juz 7", "Juz 6", "Juz 5", "Juz 4", "Juz 3", "Juz 2", "Juz 1"
  ];

  const daftarPekan = ["Pekan 1", "Pekan 2", "Pekan 3", "Pekan 4"];

  const getPekanLabel = (dateStr) => {
    if (!dateStr) return "Pekan 1 Bulan Ini";
    const d = new Date(`${dateStr}T00:00:00`);
    const day = d.getDate();
    const pekanNum = Math.min(Math.ceil(day / 7), 4);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const mName = months[d.getMonth()];
    const year = d.getFullYear();
    return `Pekan ${pekanNum} Bulan ${mName} ${year}`;
  };

  const getMonthLabel = (dateStr) => {
    if (!dateStr) return 'Bulan Tidak Diketahui';
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return 'Bulan Tidak Diketahui';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getSimplePekan = (dateStr) => {
    const label = getPekanLabel(dateStr);
    const match = label.match(/Pekan\s\d+/i);
    return match ? match[0] : 'Pekan 1';
  };

  const getTargetSesiByPeriode = (periode) => {
    if (periode === 'bulan') return 16;
    if (periode === 'pekan') return 4;
    return 1;
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ role: 'admin', name: 'Super Admin', username: 'admin', userId: 'admin' });
  const [loginInput, setLoginInput] = useState({ username: '', password: '', roleSelect: 'admin' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const getCurrentUserId = () => currentUser.userId || currentUser.username || currentUser.role;

  const [activeMenu, setActiveMenu] = useState('dashboard'); 
  const [activeSettingTab, setActiveSettingTab] = useState('profil');
  const [searchOrangTua, setSearchOrangTua] = useState('');
  const [searchMurid, setSearchMurid] = useState('');
  const [searchHalaqohMurid, setSearchHalaqohMurid] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeOrtuSubTab, setActiveOrtuSubTab] = useState('pencarian');

  const [adminHalaqohFilter, setAdminHalaqohFilter] = useState('Semua');
  const [adminPeriodeFilter, setAdminPeriodeFilter] = useState('semua');
  const [adminFilterHari, setAdminFilterHari] = useState('');
  const [adminFilterTanggal, setAdminFilterTanggal] = useState('');
  const [adminFilterPekan, setAdminFilterPekan] = useState('');
  const [adminFilterBulan, setAdminFilterBulan] = useState('');

  const [absensiPeriodeFilter, setAbsensiPeriodeFilter] = useState('semua');
  const [absensiFilterHari, setAbsensiFilterHari] = useState('');
  const [absensiFilterTanggal, setAbsensiFilterTanggal] = useState('');
  const [absensiFilterPekan, setAbsensiFilterPekan] = useState('');
  const [absensiFilterBulan, setAbsensiFilterBulan] = useState('');
  const [absensiHalaqohFilter, setAbsensiHalaqohFilter] = useState('Semua');

  const [portalPeriodeFilter, setPortalPeriodeFilter] = useState('pekan');
  const [portalFilterHari, setPortalFilterHari] = useState('');
  const [portalFilterTanggal, setPortalFilterTanggal] = useState('');
  const [portalFilterPekan, setPortalFilterPekan] = useState('');
  const [portalFilterBulan, setPortalFilterBulan] = useState('');

  const [editingId, setEditingId] = useState(null);

  // Rapor State
  const [selectedRaporMurid, setSelectedRaporMurid] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Semester Ganjil (2026/2027)');

  const [schoolProfile, setSchoolProfile] = useState(() => {
    const saved = localStorage.getItem('alafiyah_school_profile');
    return saved ? JSON.parse(saved) : {
      nama: "SMP IT Al Afiyah",
      alamat: "Kabupaten Majalengka, Jawa Barat",
      tahunAjaran: "2026/2027",
      telepon: "(0233) 123456",
      email: "info@smpitalafiyah.sch.id"
    };
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_school_profile', JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  const [manageHalaqohData, setManageHalaqohData] = useState(() => {
    const saved = localStorage.getItem('alafiyah_halaqoh_data');
    return saved ? JSON.parse(saved) : dataHalaqoh;
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_halaqoh_data', JSON.stringify(manageHalaqohData));
  }, [manageHalaqohData]);

  const [manageGuruPengampu, setManageGuruPengampu] = useState(() => {
    const saved = localStorage.getItem('alafiyah_guru_pengampu');
    return saved ? JSON.parse(saved) : guruPengampu;
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_guru_pengampu', JSON.stringify(manageGuruPengampu));
  }, [manageGuruPengampu]);

  const [newMuridInput, setNewMuridInput] = useState({ halaqoh: 'Halaqoh Tsuroyya', nama: '', nisn: '', kelas: 'Kelas 7', target: '3 Juz' });
  const [newHalaqohInput, setNewHalaqohInput] = useState('');

  const [broadcastList, setBroadcastList] = useState(() => {
    const saved = localStorage.getItem('alafiyah_broadcasts');
    return saved ? JSON.parse(saved) : [
      "📢 Pengumuman Penting: Ujian Kenaikan Level (UKL) akan dilaksanakan pada pekan depan. Harap persiapkan hafalan murid!",
      "🌟 Papan peringkat harian diperbarui secara real-time berdasarkan poin adab dan capaian setoran hafalan.",
      "📌 Mohon Ustadz/Ustadzah pengampu untuk melakukan input mutabaah harian tepat waktu di setiap sesinya."
    ];
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_broadcasts', JSON.stringify(broadcastList));
  }, [broadcastList]);

  const [currentBroadcastIdx, setCurrentBroadcastIdx] = useState(0);
  const [newBroadcastInput, setNewBroadcastInput] = useState('');

  useEffect(() => {
    if (broadcastList.length === 0) return;
    const broadcastTimer = setInterval(() => {
      setCurrentBroadcastIdx(prev => (prev + 1) % broadcastList.length);
    }, 5000);
    return () => clearInterval(broadcastTimer);
  }, [broadcastList.length]);

  const formatFirstCapital = (val) => {
    if (!val) return '';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const handleAddBroadcast = (e) => {
    e.preventDefault();
    if (!newBroadcastInput.trim()) return;
    setBroadcastList([...broadcastList, formatFirstCapital(newBroadcastInput.trim())]);
    setNewBroadcastInput('');
    alert('Pengumuman baru berhasil ditambahkan dan disiarkan!');
  };

  const handleDeleteBroadcast = (idxToRemove) => {
    if (window.confirm("Yakin ingin menghapus pengumuman ini?")) {
      const updated = broadcastList.filter((_, idx) => idx !== idxToRemove);
      setBroadcastList(updated.length > 0 ? updated : ["📢 Belum ada pengumuman aktif."]);
      setCurrentBroadcastIdx(0);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const todayDateStr = getTodayDateStr();

  useEffect(() => {
    setAdminHalaqohFilter('Semua');
    setAdminPeriodeFilter('semua');
    setAdminFilterHari('');
    setAdminFilterTanggal('');
    setAdminFilterPekan('');
    setAdminFilterBulan('');

    setAbsensiPeriodeFilter('semua');
    setAbsensiFilterHari('');
    setAbsensiFilterTanggal('');
    setAbsensiFilterPekan('');
    setAbsensiFilterBulan('');
    setAbsensiHalaqohFilter('Semua');

    setPortalPeriodeFilter('pekan');
    setPortalFilterHari('');
    setPortalFilterTanggal('');
    setPortalFilterPekan('');
    setPortalFilterBulan('');
  }, [currentUser?.userId]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const { username, password, roleSelect } = loginInput;
    const cleanUsername = username.trim().toLowerCase();

    if (roleSelect === 'ortu') {
      setIsLoggedIn(true);
      setCurrentUser({ role: 'ortu', name: 'Wali Murid', username: 'ortu', userId: 'ortu' });
      setActiveMenu('ortu');
      return;
    }

    if (roleSelect === 'admin' && cleanUsername === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setCurrentUser({ role: 'admin', name: 'Super Admin', username: 'admin', userId: 'admin' });
      setActiveMenu('dashboard');
    } else if (roleSelect === 'guru') {
      const guruMap = {
        'ustadz_mulia': { name: 'Ustadz Mulia', halaqoh: 'Halaqoh Tsuroyya' },
        'ustadz_lutfan': { name: 'Ustadz Lutfan', halaqoh: 'Halaqoh Abror' },
        'ustadz_eechram': { name: 'Ustadz Eechram', halaqoh: 'Halaqoh Zanjabila' },
        'ustadzah_amel': { name: 'Ustadzah Amel', halaqoh: 'Halaqoh Dzunnurain' },
        'ustadzah_suci': { name: 'Ustadzah Suci', halaqoh: 'Halaqoh Akhyar' }
      };

      if (guruMap[cleanUsername] && password === 'guru123') {
        const guruInfo = guruMap[cleanUsername];
        setIsLoggedIn(true);
        setCurrentUser({ 
          role: 'guru', 
          name: guruInfo.name,
          username: cleanUsername, 
          userId: cleanUsername,
          halaqoh: guruInfo.halaqoh 
        });
        setFormData(prev => ({
          ...prev,
          namaHalaqoh: guruInfo.halaqoh,
          ustadz: manageGuruPengampu[guruInfo.halaqoh] || 'Ustadz/Ustadzah'
        }));
        const defaultH = getInitialHari();
        const todayDate = getTodayDateStr();
        setFormData(prev => ({
          ...prev,
          tanggal: todayDate,
          hari: defaultH
        }));
        setAbsensiGuruData(prev => ({
          ...prev,
          namaHalaqoh: guruInfo.halaqoh,
          ustadz: manageGuruPengampu[guruInfo.halaqoh] || 'Ustadz/Ustadzah',
          tanggal: todayDate,
          hari: defaultH,
          pekan: getSimplePekan(todayDate)
        }));
        setActiveMenu('dashboard');
      } else {
        setLoginError('Username atau Password Guru salah!');
        setLoginInput(prev => ({ ...prev, password: '' }));
      }
    } else if (roleSelect === 'kepsek' && cleanUsername === 'kepsek' && password === 'kepsek123') {
      setIsLoggedIn(true);
      setCurrentUser({ role: 'kepsek', name: 'Kepala Sekolah', username: 'kepsek', userId: 'kepsek' });
      setActiveMenu('dashboard');
    } else if (roleSelect === 'kurikulum' && cleanUsername === 'kurikulum' && password === 'kurikulum123') {
      setIsLoggedIn(true);
      setCurrentUser({ role: 'kurikulum', name: 'Bagian Kurikulum', username: 'kurikulum', userId: 'kurikulum' });
      setActiveMenu('dashboard');
    } else if (roleSelect === 'kesiswaan' && cleanUsername === 'kesiswaan' && password === 'kesiswaan123') {
      setIsLoggedIn(true);
      setCurrentUser({ role: 'kesiswaan', name: 'Bagian Kesiswaan', username: 'kesiswaan', userId: 'kesiswaan' });
      setActiveMenu('dashboard');
    } else {
      setLoginError('Username atau Password yang Anda masukkan tidak sesuai dengan peran yang dipilih!');
      setLoginInput(prev => ({ ...prev, password: '' }));
    }
  };

  const handleMenuChange = (menuKey) => {
    setActiveMenu(menuKey);
    requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-scroll-area');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const getBottomNavItems = (role) => {
    const allMenus = {
      'dashboard': { label: 'Beranda', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
      'input': { label: 'Input', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
      'riwayat': { label: 'Riwayat', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      'ukl': { label: 'Ujian', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
      'rapor': { label: 'Rapor', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      'halaqoh': { label: 'Halaqoh', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
      'murid': { label: 'Murid', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
      'ortu': { label: 'Portal', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
      'absensi-guru': { label: 'Absensi', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      'pengaturan': { 
        label: 'Setting', 
        icon: (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </>
        ) 
      }
    };

    const roleMenus = {
      admin: ['dashboard', 'input', 'riwayat', 'ukl', 'rapor', 'halaqoh', 'murid', 'ortu', 'absensi-guru', 'pengaturan'],
      guru: ['dashboard', 'input', 'riwayat', 'ukl', 'rapor', 'ortu', 'absensi-guru'],
      kepsek: ['dashboard', 'riwayat', 'rapor', 'murid', 'ortu', 'halaqoh', 'absensi-guru', 'pengaturan'],
      kurikulum: ['dashboard', 'rapor', 'halaqoh', 'murid', 'riwayat', 'ortu', 'absensi-guru', 'pengaturan'],
      kesiswaan: ['dashboard', 'rapor', 'halaqoh', 'murid', 'absensi-guru', 'riwayat', 'ortu'],
      ortu: ['dashboard', 'ortu', 'halaqoh', 'murid']
    };

    return (roleMenus[role] || roleMenus.admin).map(key => ({ key, ...allMenus[key] }));
  };

  const [riwayat, setRiwayat] = useState(() => {
    const saved = localStorage.getItem('alafiyah_riwayat');
    return supabaseConfig.isConfigured ? [] : (saved ? JSON.parse(saved) : []);
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_riwayat', JSON.stringify(riwayat));
  }, [riwayat]);

  const [riwayatUkl, setRiwayatUkl] = useState(() => {
    const saved = localStorage.getItem('alafiyah_ukl');
    return supabaseConfig.isConfigured ? [] : (saved ? JSON.parse(saved) : []);
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_ukl', JSON.stringify(riwayatUkl));
  }, [riwayatUkl]);

  const [riwayatAbsensiGuru, setRiwayatAbsensiGuru] = useState(() => {
    const saved = localStorage.getItem('alafiyah_absensi_guru');
    return supabaseConfig.isConfigured ? [] : (saved ? JSON.parse(saved) : []);
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_absensi_guru', JSON.stringify(riwayatAbsensiGuru));
  }, [riwayatAbsensiGuru]);

  const [storedStudentDetails, setStoredStudentDetails] = useState(() => {
    const saved = localStorage.getItem('alafiyah_student_details');
    return saved ? JSON.parse(saved) : studentDetails;
  });
  useEffect(() => {
    localStorage.setItem('alafiyah_student_details', JSON.stringify(storedStudentDetails));
  }, [storedStudentDetails]);

  const createRecordId = () => {
    const base = Date.now();
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return Number(`${base}${suffix}`);
  };
  const handleSupabaseError = (error, context) => {
    if (!error) return;

    const message = error.message || '';
    const isMissingTable = typeof message === 'string' && message.includes("Could not find the table");
    if (isMissingTable) {
      console.warn(`[Supabase:${context}] Tabel belum tersedia. Gunakan Supabase dashboard untuk membuat tabel yang diperlukan.`);
      return;
    }

    console.error(`[Supabase:${context}]`, message || error);
    if (['insert', 'update', 'check', 'upsert'].some(prefix => context.startsWith(prefix))) {
      alert(`Gagal menyimpan data ke database: ${message || 'Periksa konfigurasi Supabase.'}`);
    }
  };

  const upsertSupabaseRow = async (table, row) => {
    if (!supabaseConfig.isConfigured || !supabaseConfig.url || !supabaseConfig.anonKey) {
      console.warn(`[Supabase:${table}] Konfigurasi Supabase belum siap. Data tetap tersimpan lokal.`);
      return null;
    }

    try {
      const payload = buildSupabasePayload(table, row);
      const url = `${supabaseConfig.url}/rest/v1/${table}`;
      const headers = {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=merge-duplicates',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify([payload]),
      });

      const responseText = await response.text();
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.warn('[Supabase:parse] respons tidak valid', parseError);
      }

      if (!response.ok) {
        const message = responseData?.message || responseText || `Request gagal dengan status ${response.status}`;
        handleSupabaseError({ message }, `insert ${table}`);
        return null;
      }

      if (import.meta.env.DEV) {
        console.log(`[Supabase:${table}] berhasil disimpan`);
      }
      return responseData;
    } catch (error) {
      console.error(`[Supabase:upsert ${table}]`, error);
      alert('Gagal menyimpan data ke database. Silakan cek koneksi Supabase.');
      return null;
    }
  };

  const deleteSupabaseRow = async (table, id) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      handleSupabaseError(error, `delete ${table}`);
      return !error;
    } catch (error) {
      console.error(`[Supabase:delete ${table}]`, error);
      return false;
    }
  };

  const mergeRemoteAndLocal = (remoteRows, localRows) => mergeRowsWithLatestState(remoteRows, localRows);

  const fetchSupabaseRows = async (table) => {
    if (!supabaseConfig.isConfigured || !supabaseConfig.url || !supabaseConfig.anonKey) {
      return [];
    }

    try {
      const url = `${supabaseConfig.url}/rest/v1/${table}?select=*&order=id.asc`;
      const headers = {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      const responseText = await response.text();

      if (!response.ok) {
        const message = responseText || `Request gagal dengan status ${response.status}`;
        handleSupabaseError({ message }, `load ${table}`);
        return [];
      }

      const data = responseText ? JSON.parse(responseText) : [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`[Supabase:load ${table}]`, error);
      return [];
    }
  };

  const loadCentralData = async () => {
    if (!supabaseConfig.isConfigured) {
      console.warn('[Supabase] Lewati loadCentralData karena konfigurasi belum siap.');
      return;
    }

    try {
      const [riwayatRows, uklRows, absensiRows] = await Promise.all([
        fetchSupabaseRows('riwayat'),
        fetchSupabaseRows('riwayat_ukl'),
        fetchSupabaseRows('riwayat_absensi_guru')
      ]);

      const hasMissingRiwayatCoreFields = (row) => (
        row?.pekan_label == null ||
        row?.hadir == null ||
        row?.jenis_setoran == null ||
        row?.rincian_capaian == null ||
        row?.predikat == null ||
        row?.skor_adab == null ||
        row?.skor_capaian == null ||
        row?.total_skor_poin == null
      );

      const rowsToRepair = riwayatRows
        .filter((row) => hasMissingRiwayatCoreFields(row) && !repairedRiwayatIdsRef.current.has(row.id))
        .slice(0, 50);

      if (rowsToRepair.length > 0) {
        await Promise.all(rowsToRepair.map(async (row) => {
          const normalized = deserializeSupabaseRow('riwayat', row);
          const repairedRow = {
            ...normalized,
            pekanLabel: normalized.pekanLabel || 'Pekan 1',
          };
          const repaired = await upsertSupabaseRow('riwayat', repairedRow);
          if (repaired) {
            repairedRiwayatIdsRef.current.add(row.id);
          }
        }));
      }

      const convertRows = (rows, tableName) => rows.map(row => deserializeSupabaseRow(tableName, row));

      const remoteRiwayat = convertRows(riwayatRows, 'riwayat');
      const remoteUkl = convertRows(uklRows, 'riwayat_ukl');
      const remoteAbsensi = convertRows(absensiRows, 'riwayat_absensi_guru');

      setRiwayat(remoteRiwayat);
      setRiwayatUkl(remoteUkl);
      setRiwayatAbsensiGuru(remoteAbsensi);
    } catch (error) {
      console.error('[Supabase:loadCentralData]', error);
    }
  };

  const subscribeToRealtime = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
      return () => {};
    }

    const channels = [];
    const subscribed = { ref: new Set() };
    const tables = [
      { table: 'riwayat', setter: setRiwayat },
      { table: 'riwayat_ukl', setter: setRiwayatUkl },
      { table: 'riwayat_absensi_guru', setter: setRiwayatAbsensiGuru }
    ];

    tables.forEach(({ table, setter }) => {
      try {
        // prevent double-subscribe (React StrictMode or HMR can call effect twice)
        if (subscribed.ref.has(table)) return;

        // remove any existing channel that mentions the table (best-effort)
        try {
          if (typeof supabase.getChannels === 'function') {
            const existing = supabase.getChannels().filter(c => c.topic && (c.topic.includes(table) || c.topic.includes(`realtime-${table}`)));
            existing.forEach(ch => supabase.removeChannel && supabase.removeChannel(ch));
          }
        } catch (e) {
          // ignore getChannels/removeChannel errors
        }

        const channel = supabase
          .channel(`realtime-${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            const event = payload.eventType || payload.type || payload.event;
            if (event === 'INSERT' || event === 'UPDATE') {
              const newRow = payload.new ?? payload.record ?? null;
              if (!newRow) return;
              const camel = deserializeSupabaseRow(table, newRow);
              setter(prev => {
                const exists = prev.some(r => r.id === camel.id);
                if (exists) return prev.map(r => r.id === camel.id ? camel : r);
                return [...prev, camel];
              });
            } else if (event === 'DELETE') {
              const oldRow = payload.old ?? payload.record ?? null;
              const id = oldRow?.id ?? null;
              if (!id) return;
              setter(prev => prev.filter(r => r.id !== id));
            }
          })
          .subscribe();

        channels.push(channel);
        subscribed.ref.add(table);
      } catch (e) {
        console.warn('[Supabase:realtime] subscribe failed for', table, e);
      }
    });

    return () => {
      try {
        channels.forEach(ch => supabase.removeChannel && supabase.removeChannel(ch));
      } catch (e) {
        console.warn('[Supabase:realtime] cleanup failed', e);
      }
    };
  };

  useEffect(() => {
    let cleanup = null;
    let poller = null;

    (async () => {
      await loadCentralData();
      cleanup = subscribeToRealtime();
    })();

    const syncWhenVisible = () => {
      loadCentralData();
    };

    if (typeof window !== 'undefined') {
      poller = window.setInterval(() => {
        loadCentralData();
      }, 10000);
      window.addEventListener('focus', syncWhenVisible);
      document.addEventListener('visibilitychange', syncWhenVisible);
    }

    return () => {
      if (typeof cleanup === 'function') cleanup();
      if (poller) window.clearInterval(poller);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', syncWhenVisible);
        document.removeEventListener('visibilitychange', syncWhenVisible);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadCentralData();
  }, [isLoggedIn, currentUser?.userId]);

  const handleExportExcel = () => {
    if (currentUser.role !== 'admin') {
      alert('Maaf, fitur ekspor data hanya dapat diakses oleh Admin.');
      return;
    }
    if (riwayat.length === 0) {
      alert('Belum ada data riwayat untuk diekspor.');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; width: 100%; margin-bottom: 25px; }
          th { background-color: #004080; color: white; font-weight: bold; padding: 10px; border: 1.5px solid #002244; text-align: left; }
          td { padding: 8px 10px; vertical-align: middle; border: 1px solid #b8d0e5; mso-number-format:"\\@"; text-align: left; }
          .center { text-align: center; }
          .left { text-align: left; }
          .bold { font-weight: bold; }
          .title-main { color: #004080; font-family: Arial, sans-serif; font-size: 15pt; font-weight: bold; margin-top: 30px; margin-bottom: 5px; }
          .title-pekan { color: #004080; font-family: Arial, sans-serif; font-size: 12pt; font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
          .title-halaqoh { color: #004080; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; margin-top: 10px; margin-bottom: 8px; font-style: italic; border-bottom: 2px solid #004080; padding-bottom: 4px; }
        </style>
      </head>
      <body>
    `;

    const sortedRiwayat = [...riwayat].sort((a, b) => String(a.tanggal || '').localeCompare(String(b.tanggal || '')));
    const monthGroups = sortedRiwayat.reduce((acc, item) => {
      const monthKey = String(item.tanggal || '').slice(0, 7) || 'tanpa-bulan';
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {});

    Object.keys(monthGroups).sort().forEach((monthKey) => {
      const monthItems = monthGroups[monthKey];
      if (monthItems.length === 0) return;

      html += `<div class="title-main">Rekapan Pekanan/Bulanan Tahfidz ${schoolProfile.nama}</div>`;
      html += `<div class="title-pekan">Bulan: ${getMonthLabel(monthItems[0]?.tanggal)}</div>`;

      const pekanList = [...new Set(monthItems.map(i => i.pekanLabel || getPekanLabel(i.tanggal)))];

      pekanList.forEach((pekanName) => {
        const pekanItems = monthItems.filter(i => (i.pekanLabel || getPekanLabel(i.tanggal)) === pekanName);
        if (pekanItems.length === 0) return;

        html += `<div class="title-pekan">${pekanName}</div>`;

        const halaqohListInPekan = [...new Set(pekanItems.map(i => i.halaqoh))];

        halaqohListInPekan.forEach(halaqohName => {
          const items = pekanItems.filter(i => i.halaqoh === halaqohName);
          if (items.length === 0) return;

          const pengampuName = manageGuruPengampu[halaqohName] || 'Ustadz/Ustadzah';
          html += `<div class="title-halaqoh">${halaqohName} — Pengampu: ${pengampuName}</div>`;

          html += `
            <table>
              <tr>
                <th class="center" style="width: 50px;">No</th>
                <th class="left" style="width: 220px;">Nama Murid</th>
                <th class="left" style="width: 130px;">Tgl</th>
                <th class="left" style="width: 90px;">Hari</th>
                <th class="left" style="width: 110px;">Kehadiran</th>
                <th class="left" style="width: 220px;">Jenis Setoran</th>
                <th class="left" style="width: 450px;">Rincian Capaian</th>
                <th class="left" style="width: 160px;">Predikat</th>
                <th class="left" style="width: 100px;">Skor Adab</th>
              </tr>
          `;

          items.forEach((item, idx) => {
            html += `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="left bold">${item.namaAsli}</td>
                <td class="left">${formatDateDisplay(item.tanggal)}</td>
                <td class="left">${item.hari}</td>
                <td class="left">${item.hadir}</td>
                <td class="left">${item.jenisSetoran}</td>
                <td class="left">${item.rincianCapaian}</td>
                <td class="left">${item.predikat}</td>
                <td class="left">${item.skorAdab}/10</td>
              </tr>
            `;
          });

          html += `</table><br>`;
        });
      });
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const todayDownload = getTodayDateStr();
    link.download = `rekap_mutabaah_bulanan_pekanan_${todayDownload}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAbsensiExcel = () => {
    if (currentUser.role !== 'admin') {
      alert('Maaf, fitur ekspor absensi hanya dapat diakses oleh Admin.');
      return;
    }
    if (riwayatAbsensiGuru.length === 0) {
      alert('Belum ada data absensi pengampu untuk diekspor.');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; width: 100%; margin-bottom: 25px; }
          th { background-color: #004080; color: white; font-weight: bold; padding: 10px; border: 1.5px solid #002244; text-align: left; }
          td { padding: 8px 10px; vertical-align: middle; border: 1px solid #b8d0e5; mso-number-format:"\\@"; text-align: left; }
          .center { text-align: center; }
          .left { text-align: left; }
          .bold { font-weight: bold; }
          .title-main { color: #004080; font-family: Arial, sans-serif; font-size: 15pt; font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
          .title-sub { color: #004080; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; margin-top: 8px; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="title-main">Rekap Absensi Pengampu Tahfidz ${schoolProfile.nama}</div>
    `;

    const sortedAbsensi = [...riwayatAbsensiGuru].sort((a, b) => String(a.tanggal || '').localeCompare(String(b.tanggal || '')));
    const monthGroups = sortedAbsensi.reduce((acc, item) => {
      const monthKey = String(item.tanggal || '').slice(0, 7) || 'tanpa-bulan';
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {});

    Object.keys(monthGroups).sort().forEach((monthKey) => {
      const monthItems = monthGroups[monthKey];
      html += `<div class="title-sub">Bulan: ${getMonthLabel(monthItems[0]?.tanggal)}</div>`;

      const pekanGroups = monthItems.reduce((acc, item) => {
        const pekanName = item.pekan || getSimplePekan(item.tanggal);
        if (!acc[pekanName]) acc[pekanName] = [];
        acc[pekanName].push(item);
        return acc;
      }, {});

      Object.keys(pekanGroups).forEach((pekanName) => {
        html += `<div class="title-sub">${pekanName}</div>`;
        html += `
          <table>
            <tr>
              <th class="center" style="width: 50px;">No</th>
              <th class="left" style="width: 200px;">Halaqoh</th>
              <th class="left" style="width: 200px;">Nama Pengampu</th>
              <th class="left" style="width: 130px;">Tgl</th>
              <th class="left" style="width: 100px;">Hari</th>
              <th class="left" style="width: 120px;">Pekan</th>
              <th class="left" style="width: 120px;">Kehadiran</th>
              <th class="left" style="width: 300px;">Keterangan</th>
            </tr>
        `;

        pekanGroups[pekanName].forEach((item, idx) => {
          html += `
            <tr>
              <td class="center">${idx + 1}</td>
              <td class="left bold">${item.namaHalaqoh}</td>
              <td class="left">${item.ustadz}</td>
              <td class="left">${formatDateDisplay(item.tanggal)}</td>
              <td class="left">${item.hari}</td>
              <td class="left">${item.pekan || getSimplePekan(item.tanggal)}</td>
              <td class="left">${item.kehadiran}</td>
              <td class="left">${item.keterangan || '-'}</td>
            </tr>
          `;
        });

        html += `</table><br>`;
      });
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const todayDownload = getTodayDateStr();
    link.download = `rekap_absensi_pengampu_${todayDownload}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsApp = (item) => {
    const pengampuName = manageGuruPengampu[item.halaqoh] || 'Ustadz/Ustadzah';
    const message = `Bismillah\n\nBerikut adalah laporan Mutaba'ah Tahfidz ananda *${item.namaAsli}* (${item.halaqoh}) pada tanggal ${formatDateDisplay(item.tanggal)}:\n\n- Kehadiran: ${item.hadir}\n- Capaian: ${item.jenisSetoran} - ${item.rincianCapaian}\n- Predikat: ${item.predikat}\n- Skor Adab: ${item.skorAdab}/10\n${item.evaluasiBacaan?.catatan ? `- Catatan Guru: ${item.evaluasiBacaan.catatan}\n` : ''}\nPengampu: *${pengampuName}*\n\nJazakumullahu khairan katsiran.\n_${schoolProfile.nama}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const hapusRiwayatItem = (id) => {
    if (window.confirm("Yakin ingin menghapus data riwayat ini?")) {
      setRiwayat(riwayat.filter(item => item.id !== id));
      deleteSupabaseRow('riwayat', id);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const hapusUklItem = (id) => {
    if (window.confirm("Yakin ingin menghapus data ujian ini?")) {
      setRiwayatUkl(riwayatUkl.filter(item => item.id !== id));
      deleteSupabaseRow('riwayat_ukl', id);
    }
  };

  const handleDownloadCertificatePdf = (u) => {
    if (currentUser.role !== 'admin') {
      alert('Maaf, fitur cetak/unduh sertifikat hanya dapat diakses oleh Admin.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up pada browser Anda untuk mengunduh sertifikat.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sertifikat - ${u.namaAsli}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            background-color: #fffdf9;
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-container {
            width: 297mm;
            height: 210mm;
            box-sizing: border-box;
            background-color: #fffdf9;
            padding: 15mm;
            border: 12px solid #1e3a8a;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
          }
          .inner-border {
            border: 3px solid #d97706;
            width: 100%;
            height: 100%;
            padding: 10mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="inner-border">
            <div>
              <h3 style="font-size: 18px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin: 0;">${schoolProfile.nama}</h3>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 15px 0;">${schoolProfile.alamat}</p>
              <h1 style="font-size: 32px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0;">Sertifikat Penghargaan</h1>
              <p style="font-size: 14px; font-style: italic; color: #334155; margin: 0;">Diberikan dengan bangga kepada:</p>
            </div>

            <div>
              <h2 style="font-size: 36px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #b45309; padding-bottom: 8px; margin: 0 auto 10px auto; display: inline-block; min-width: 400px;">
                ${u.namaAsli}
              </h2>
              <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 10px auto 0 auto; max-width: 800px;">
                Atas keberhasilan dan kelulusan dalam <b>${u.jenisUjian}</b> dengan predikat <b style="color: #047857;">${u.hasilUjian}</b> pada materi <b>${u.materiUjian}</b>.
              </p>
              ${u.catatanUjian ? `<p style="font-size: 13px; color: #64748b; font-style: italic; margin: 8px 0 0 0;">Catatan Penguji: "${u.catatanUjian}"</p>` : ''}
            </div>

            <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-end;">
              <div style="text-align: center; width: 250px;">
                <p style="font-size: 13px; font-weight: bold; margin: 0 0 50px 0; color: #334155;">Ustadz/ah Penguji</p>
                <p style="font-size: 13px; font-weight: bold; text-decoration: underline; margin: 0; color: #0f172a;">${u.penguji}</p>
              </div>
              <div style="text-align: center; width: 250px;">
                <p style="font-size: 13px; font-weight: bold; margin: 0 0 50px 0; color: #334155;">${schoolProfile.alamat.split(',')[1] || 'Majalengka'}, ${formatDateDisplay(u.tanggal)}</p>
                <p style="font-size: 13px; font-weight: bold; text-decoration: underline; margin: 0; color: #0f172a;">Kepala Sekolah</p>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadRaporPdf = (muridNama) => {
    if (!['admin', 'guru', 'kepsek'].includes(currentUser.role)) {
      alert('Maaf, fitur unduh rapor hanya dapat diakses oleh Admin, Pengampu, atau Kepala Sekolah.');
      return;
    }
    if (!muridNama) {
      alert('Silakan pilih murid terlebih dahulu.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up pada browser Anda untuk mengunduh rapor.');
      return;
    }

    let halaqohMurid = '-';
    Object.entries(manageHalaqohData).forEach(([hName, list]) => {
      if (list.includes(muridNama)) halaqohMurid = hName;
    });
    const pengampu = manageGuruPengampu[halaqohMurid] || '-';
    const detail = storedStudentDetails[muridNama] || { nisn: '-', kelas: 'Kelas 7', target: '3 Juz' };
    const mRiwayat = riwayat.filter(i => i.namaAnak === muridNama.trim().toLowerCase());
    const mUkl = riwayatUkl.filter(u => u.namaKey === muridNama.trim().toLowerCase());

    const totalHadir = mRiwayat.filter(i => i.hadir === 'Hadir').length;
    const totalIzin = mRiwayat.filter(i => i.hadir === 'Izin').length;
    const totalSakit = mRiwayat.filter(i => i.hadir === 'Sakit').length;
    const totalAlpha = mRiwayat.filter(i => i.hadir === 'Alpha').length;
    const avgAdab = mRiwayat.length > 0 ? (mRiwayat.reduce((a, c) => a + c.skorAdab, 0) / mRiwayat.length).toFixed(1) : '0';
    const totalPoin = mRiwayat.reduce((a, c) => a + c.totalSkorPoin, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapor Semester - ${muridNama}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: Arial, sans-serif;
            color: #1e293b;
            font-size: 11pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #1e3a8a;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h2 { margin: 0; color: #1e3a8a; font-size: 16pt; text-transform: uppercase; }
          .header h3 { margin: 4px 0; color: #b45309; font-size: 13pt; }
          .header p { margin: 2px 0; color: #64748b; font-size: 9.5pt; }
          
          .info-table {
            width: 100%;
            margin-bottom: 20px;
            font-size: 10.5pt;
            border-collapse: collapse;
          }
          .info-table td { padding: 4px 0; }

          .section-title {
            background-color: #1e3a8a;
            color: white;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11pt;
            margin-top: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
          }

          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10pt;
          }
          table.data-table th, table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          table.data-table th {
            background-color: #f1f5f9;
            color: #0f172a;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 200px;
          }
          .sig-space {
            height: 60px;
          }
          .sig-name {
            font-weight: bold;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${schoolProfile.nama}</h2>
          <h3>Laporan Hasil Belajar Semester (Rapor Tahfidz)</h3>
          <p>${schoolProfile.alamat} | Telp: ${schoolProfile.telepon}</p>
        </div>

        <table class="info-table">
          <tr>
            <td style="width: 15%;"><b>Nama Murid</b></td>
            <td style="width: 35%;">: <b>${muridNama}</b></td>
            <td style="width: 15%;"><b>Halaqoh</b></td>
            <td style="width: 35%;">: ${halaqohMurid}</td>
          </tr>
          <tr>
            <td><b>NISN</b></td>
            <td>: ${detail.nisn}</td>
            <td><b>Pengampu</b></td>
            <td>: ${pengampu}</td>
          </tr>
          <tr>
            <td><b>Kelas</b></td>
            <td>: ${detail.kelas}</td>
            <td><b>Semester</b></td>
            <td>: ${selectedSemester}</td>
          </tr>
          <tr>
            <td><b>Target Hafalan</b></td>
            <td>: ${detail.target}</td>
            <td><b>Tahun Ajaran</b></td>
            <td>: ${schoolProfile.tahunAjaran}</td>
          </tr>
        </table>

        <div class="section-title">A. Rekapitulasi Kehadiran & Kedisiplinan</div>
        <table class="data-table">
          <tr>
            <th class="center">Hadir</th>
            <th class="center">Izin</th>
            <th class="center">Sakit</th>
            <th class="center">Alpha</th>
            <th class="center">Rata-rata Skor Adab (/10)</th>
            <th class="center">Akumulasi Poin</th>
          </tr>
          <tr>
            <td class="center">${totalHadir} sesi</td>
            <td class="center">${totalIzin} sesi</td>
            <td class="center">${totalSakit} sesi</td>
            <td class="center">${totalAlpha} sesi</td>
            <td class="center"><b>${avgAdab}</b></td>
            <td class="center"><b>${totalPoin} Poin</b></td>
          </tr>
        </table>

        <div class="section-title">B. Capaian Setoran & Mutaba'ah Harian</div>
        ${mRiwayat.length === 0 ? '<p style="font-style: italic; color: #64748b;">Belum ada catatan mutabaah harian pada semester ini.</p>' : `
          <table class="data-table">
            <tr>
              <th style="width: 15%;">Tanggal</th>
              <th style="width: 25%;">Jenis Setoran</th>
              <th style="width: 40%;">Rincian Capaian</th>
              <th style="width: 20%;">Predikat</th>
            </tr>
            ${mRiwayat.map(item => `
              <tr>
                <td>${formatDateDisplay(item.tanggal)}</td>
                <td><b>${item.jenisSetoran}</b></td>
                <td>${item.rincianCapaian}</td>
                <td>${item.predikat}</td>
              </tr>
            `).join('')}
          </table>
        `}

        <div class="section-title">C. Ujian Kenaikan Level (UKL) & Tasmi'</div>
        ${mUkl.length === 0 ? '<p style="font-style: italic; color: #64748b;">Belum ada catatan ujian kenaikan level pada semester ini.</p>' : `
          <table class="data-table">
            <tr>
              <th style="width: 20%;">Tanggal</th>
              <th style="width: 30%;">Jenis Ujian</th>
              <th style="width: 30%;">Materi</th>
              <th style="width: 20%;">Hasil</th>
            </tr>
            ${mUkl.map(u => `
              <tr>
                <td>${formatDateDisplay(u.tanggal)}</td>
                <td><b>${u.jenisUjian}</b></td>
                <td>${u.materiUjian}</td>
                <td><b>${u.hasilUjian}</b></td>
              </tr>
            `).join('')}
          </table>
        `}

        <div class="signatures">
          <div class="sig-box">
            <p>Mengetahui,<br>Orang Tua / Wali Murid</p>
            <div class="sig-space"></div>
            <p class="sig-name">( ........................................ )</p>
          </div>
          <div class="sig-box">
            <p>${schoolProfile.alamat.split(',')[1] || 'Majalengka'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Ustadz/ah Pengampu Halaqoh</p>
            <div class="sig-space"></div>
            <p class="sig-name">${pengampu}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const hapusAbsensiGuruItem = (id) => {
    if (window.confirm("Yakin ingin menghapus data absensi ini?")) {
      setRiwayatAbsensiGuru(riwayatAbsensiGuru.filter(item => item.id !== id));
      deleteSupabaseRow('riwayat_absensi_guru', id);
    }
  };

  const handleAddMurid = (e) => {
    e.preventDefault();
    if (!newMuridInput.nama.trim()) return;
    const namaClean = newMuridInput.nama.trim();
    const hTarget = newMuridInput.halaqoh;

    if (manageHalaqohData[hTarget].includes(namaClean)) {
      alert('Murid dengan nama tersebut sudah ada di halaqoh ini!');
      return;
    }

    const updatedHalaqoh = {
      ...manageHalaqohData,
      [hTarget]: [...manageHalaqohData[hTarget], namaClean]
    };
    setManageHalaqohData(updatedHalaqoh);

    const updatedDetails = {
      ...storedStudentDetails,
      [namaClean]: {
        nisn: newMuridInput.nisn.trim() || '-',
        kelas: newMuridInput.kelas,
        target: newMuridInput.target
      }
    };
    setStoredStudentDetails(updatedDetails);

    setNewMuridInput({ halaqoh: hTarget, nama: '', nisn: '', kelas: 'Kelas 7', target: '3 Juz' });
    alert('Murid baru berhasil ditambahkan!');
  };

  const handleDeleteMurid = (halaqohName, namaMurid) => {
    if (window.confirm(`Yakin ingin menghapus murid ${namaMurid} dari ${halaqohName}?`)) {
      const updatedList = manageHalaqohData[halaqohName].filter(m => m !== namaMurid);
      setManageHalaqohData({
        ...manageHalaqohData,
        [halaqohName]: updatedList
      });
    }
  };

  const handleAddHalaqoh = (e) => {
    e.preventDefault();
    const hName = newHalaqohInput.trim();
    if (!hName) return;
    if (manageHalaqohData[hName]) {
      alert('Nama halaqoh sudah ada!');
      return;
    }
    setManageHalaqohData({ ...manageHalaqohData, [hName]: [] });
    setManageGuruPengampu({ ...manageGuruPengampu, [hName]: 'Belum ditentukan' });
    setNewHalaqohInput('');
    alert('Halaqoh baru berhasil ditambahkan!');
  };

  const handleDeleteHalaqoh = (halaqohName) => {
    if (Object.keys(manageHalaqohData).length <= 1) {
      alert('Tidak dapat menghapus seluruh halaqoh. Minimal harus ada 1 halaqoh.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus ${halaqohName} beserta seluruh data murid di dalamnya?`)) {
      const updatedHalaqohData = { ...manageHalaqohData };
      delete updatedHalaqohData[halaqohName];
      setManageHalaqohData(updatedHalaqohData);

      const updatedGuruPengampu = { ...manageGuruPengampu };
      delete updatedGuruPengampu[halaqohName];
      setManageGuruPengampu(updatedGuruPengampu);

      alert(`Halaqoh ${halaqohName} berhasil dihapus dari sistem.`);
    }
  };

  const handleUpdatePengampu = (halaqohName, namaUstadzVal) => {
    setManageGuruPengampu({
      ...manageGuruPengampu,
      [halaqohName]: namaUstadzVal
    });
    alert(`Pengampu ${halaqohName} berhasil diperbarui!`);
  };

  const initH = getInitialHari();
  const firstHalaqohKey = Object.keys(manageHalaqohData)[0] || 'Halaqoh Tsuroyya';
  const firstMuridKey = manageHalaqohData[firstHalaqohKey]?.[0] || '';
  const initialFormDate = getTodayDateStr();

  const [formData, setFormData] = useState({
    namaHalaqoh: firstHalaqohKey,
    namaAnak: firstMuridKey,
    ustadz: manageGuruPengampu[firstHalaqohKey] || '',
    tanggal: initialFormDate,
    hari: initH,
    kehadiran: 'Hadir',
    
    datangTepatWaktu: false,
    memakaiSongkok: false,
    penampilanRapi: false,
    menjawabSalam: false,
    menghormatiGuru: false,
    fokusHafalan: false,
    tidakNgantuk: false,
    tidakMainMain: false,
    berusahaHafalan: false,
    suaraJelasTerdengar: false,

    sudahSetoran: false,
    mencapaiTarget: false,
    sudahMurojaahMandiri: false,
    sudahTahsin: false,

    jenisSetoran: 'Ziyadah (Hafalan Baru)',
    namaSurat: 'Al-Mulk',
    namaTamhidi: 'Tamhidi Jilid 1',
    namaJuz: 'Juz 30',
    ayatMulai: '',
    ayatSelesai: '',
    
    adaSuratKedua: false,
    namaSurat2: 'Al-Mulk',
    ayatMulai2: '',
    ayatSelesai2: '',

    predikat: 'Qowy (Kuat)',

    evalMakhrajSifat: 'Qowy (Kuat)',
    evalTajwidMad: 'Qowy (Kuat)',
    evalKelancaranKefasihan: 'Qowy (Kuat)',
    catatanSetoran: '',
  });

  const [uklData, setUklData] = useState({
    namaHalaqoh: firstHalaqohKey,
    namaAnak: firstMuridKey,
    jenisUjian: 'Kenaikan Jilid Tamhidi',
    materiUjian: 'Tamhidi Jilid 1',
    penguji: manageGuruPengampu[firstHalaqohKey] || '',
    tanggal: initialFormDate,
    hasilUjian: 'Lulus (Naik Level)',
    catatanUjian: '',
  });

  const initialAbsensiDate = getTodayDateStr();

  const [absensiGuruData, setAbsensiGuruData] = useState({
    namaHalaqoh: firstHalaqohKey,
    ustadz: manageGuruPengampu[firstHalaqohKey] || '',
    tanggal: initialAbsensiDate,
    hari: initH,
    pekan: getSimplePekan(initialAbsensiDate),
    kehadiran: 'Hadir',
    keterangan: ''
  });

  useEffect(() => {
    if (!['input', 'absensi-guru'].includes(activeMenu)) return;
    const todayDate = getTodayDateStr();
    const todayHari = getInitialHari();
    setFormData(prev => ({ ...prev, tanggal: todayDate, hari: todayHari }));
    setAbsensiGuruData(prev => ({ ...prev, tanggal: todayDate, hari: todayHari, pekan: getSimplePekan(todayDate) }));
  }, [activeMenu]);

  const isTamhidi = formData.jenisSetoran === "Tamhidi";
  const isTasmiJuz = formData.jenisSetoran === "Tasmi' 1 Juz";
  const isTahsin = formData.jenisSetoran === "Tahsin (Perbaikan Bacaan)";
  const isTidakSetoran = formData.jenisSetoran === "Tidak Setoran (Hadir Saja)";
  const isTahsinOrTamhidi = isTamhidi || isTahsin;

  const getMaxAyatCurrent = () => {
    if (isTamhidi) return jumlahHalamanTamhidi[formData.namaTamhidi] || 30;
    if (isTahsinOrTamhidi || !isTasmiJuz) {
      return jumlahAyatSurah[formData.namaSurat] || 286;
    }
    return 1;
  };

  const getMaxAyatSurat2 = () => {
    return jumlahAyatSurah[formData.namaSurat2] || 286;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'tanggal') {
      setFormData(prev => ({ ...prev, tanggal: value, hari: getHariByTanggal(value) }));
      return;
    }
    if (name === 'namaHalaqoh') {
      const muridPertama = manageHalaqohData[value]?.[0] || '';
      setFormData(prev => ({
        ...prev,
        namaHalaqoh: value,
        namaAnak: muridPertama,
        ustadz: manageGuruPengampu[value] || ''
      }));
    } else if (name === 'hari') {
      const autoTanggal = getTanggalByHari(value);
      setFormData(prev => ({
        ...prev,
        hari: value,
        tanggal: autoTanggal
      }));
    } else if (name === 'jenisSetoran') {
      setFormData(prev => ({
        ...prev,
        jenisSetoran: value,
        ayatMulai: '',
        ayatSelesai: ''
      }));
    } else if (name === 'namaSurat' || name === 'namaTamhidi') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ayatMulai: '',
        ayatSelesai: ''
      }));
    } else if (name === 'ayatMulai' || name === 'ayatSelesai') {
      const maxLimit = getMaxAyatCurrent();
      let numVal = value === '' ? '' : parseInt(value, 10);
      if (numVal !== '' && !isNaN(numVal)) {
        if (numVal < 1) numVal = 1;
        if (numVal > maxLimit) numVal = maxLimit;
      }
      setFormData(prev => ({ ...prev, [name]: numVal }));
    } else if (name === 'ayatMulai2' || name === 'ayatSelesai2') {
      const maxLimit2 = getMaxAyatSurat2();
      let numVal2 = value === '' ? '' : parseInt(value, 10);
      if (numVal2 !== '' && !isNaN(numVal2)) {
        if (numVal2 < 1) numVal2 = 1;
        if (numVal2 > maxLimit2) numVal2 = maxLimit2;
      }
      setFormData(prev => ({ ...prev, [name]: numVal2 }));
    } else {
      let processedVal = type === 'checkbox' ? checked : value;
      if (name === 'catatanSetoran' && typeof processedVal === 'string') {
        processedVal = formatFirstCapital(processedVal);
      }
      setFormData(prev => ({ 
        ...prev, 
        [name]: processedVal 
      }));
    }
  };

  const handleUklChange = (e) => {
    const { name, value } = e.target;
    if (name === 'namaHalaqoh') {
      const muridPertama = manageHalaqohData[value]?.[0] || '';
      setUklData(prev => ({
        ...prev,
        namaHalaqoh: value,
        namaAnak: muridPertama,
        penguji: manageGuruPengampu[value] || ''
      }));
    } else if (name === 'jenisUjian') {
      let defaultMateri = 'Tamhidi Jilid 1';
      if (value === "Kenaikan Juz Al-Qur'an" || value === "Ujian Tasmi' 1 Juz") {
        defaultMateri = 'Juz 30';
      }
      setUklData(prev => ({ ...prev, jenisUjian: value, materiUjian: defaultMateri }));
    } else {
      let processedVal = value;
      if (name === 'catatanUjian') {
        processedVal = formatFirstCapital(processedVal);
      }
      setUklData(prev => ({ ...prev, [name]: processedVal }));
    }
  };

  const handleAbsensiGuruChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tanggal') {
      setAbsensiGuruData(prev => ({
        ...prev,
        tanggal: value,
        hari: getHariByTanggal(value),
        pekan: getSimplePekan(value)
      }));
      return;
    }
    if (name === 'namaHalaqoh') {
      setAbsensiGuruData(prev => ({ ...prev, namaHalaqoh: value, ustadz: manageGuruPengampu[value] || '' }));
    } else if (name === 'hari') {
      const autoTanggal = getTanggalByHari(value);
      setAbsensiGuruData(prev => ({ ...prev, hari: value, tanggal: autoTanggal, pekan: getSimplePekan(autoTanggal) }));
    } else {
      let processedVal = value;
      if (name === 'keterangan') {
        processedVal = formatFirstCapital(processedVal);
      }
      setAbsensiGuruData(prev => ({ ...prev, [name]: processedVal }));
    }
  };

  const handleEditItem = (item) => {
    setEditingId(item.id);
    setActiveMenu('input');
    requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-scroll-area');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    setFormData(prev => ({
      ...prev,
      namaHalaqoh: item.halaqoh,
      namaAnak: item.namaAsli,
      tanggal: item.tanggal,
      hari: item.hari,
      kehadiran: item.hadir,
      jenisSetoran: item.jenisSetoran !== '-' ? item.jenisSetoran : 'Ziyadah (Hafalan Baru)',
      predikat: item.predikat !== '-' && item.predikat !== item.hadir ? item.predikat : 'Qowy (Kuat)',
      catatanSetoran: item.evaluasiBacaan?.catatan || '',
      evalMakhrajSifat: item.evaluasiBacaan?.makhrajSifat || 'Qowy (Kuat)',
      evalTajwidMad: item.evaluasiBacaan?.tajwidMad || 'Qowy (Kuat)',
      evalKelancaranKefasihan: item.evaluasiBacaan?.kelancaranKefasihan || 'Qowy (Kuat)',
    }));
  };

  const normalizeAyatRange = (start, end, maxLimit) => {
    const parsedStart = Number.isFinite(Number(start)) ? Number(start) : 1;
    const parsedEnd = Number.isFinite(Number(end)) ? Number(end) : 1;
    const safeMax = Number.isFinite(Number(maxLimit)) ? Number(maxLimit) : 1;
    const safeStart = Math.min(Math.max(parsedStart, 1), safeMax);
    const safeEnd = Math.min(Math.max(parsedEnd, 1), safeMax);
    return {
      ayatMulai: Math.min(safeStart, safeEnd),
      ayatSelesai: Math.max(safeStart, safeEnd),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const muridDiHalaqoh = manageHalaqohData[formData.namaHalaqoh]?.includes(formData.namaAnak);
    if (!muridDiHalaqoh) {
      alert('Nama murid tidak terdaftar pada halaqoh yang dipilih. Silakan pilih ulang halaqoh/nama murid agar tidak tertukar.');
      return;
    }

    const isHadir = formData.kehadiran === 'Hadir';
    const currentMax = getMaxAyatCurrent();
    const normalizedRange = normalizeAyatRange(formData.ayatMulai, formData.ayatSelesai, currentMax);
    const normalizedRange2 = formData.adaSuratKedua ? normalizeAyatRange(formData.ayatMulai2, formData.ayatSelesai2, getMaxAyatSurat2()) : null;

    const totalAdab = isHadir ? [
      formData.datangTepatWaktu, formData.memakaiSongkok, formData.penampilanRapi, formData.menjawabSalam, 
      formData.menghormatiGuru, formData.fokusHafalan, formData.tidakNgantuk, 
      formData.tidakMainMain, formData.berusahaHafalan, formData.suaraJelasTerdengar
    ].filter(Boolean).length : 0;

    const totalCapaian = (isHadir && !isTidakSetoran) ? (
      isTahsinOrTamhidi 
        ? [formData.sudahTahsin].filter(Boolean).length 
        : [formData.sudahSetoran, formData.mencapaiTarget, formData.sudahMurojaahMandiri].filter(Boolean).length
    ) : 0;

    let rincianCapaian = '';
    if (isHadir) {
      if (isTidakSetoran) {
        rincianCapaian = `Hadir (Tanpa Setoran)${formData.catatanSetoran ? ` - Catatan/Alasan: ${formData.catatanSetoran}` : ''}`;
      } else if (isTamhidi) {
        const safeRange = normalizeAyatRange(formData.ayatMulai, formData.ayatSelesai, currentMax);
        rincianCapaian = `${formData.namaTamhidi}, Halaman ${safeRange.ayatMulai}-${safeRange.ayatSelesai}`;
      } else if (isTahsin) {
        const safeRange = normalizeAyatRange(formData.ayatMulai, formData.ayatSelesai, currentMax);
        rincianCapaian = `${formData.namaSurat}, Ayat ${safeRange.ayatMulai}-${safeRange.ayatSelesai}`;
      } else if (isTasmiJuz) {
        rincianCapaian = `${formData.namaJuz} (Full 1 Juz)`;
      } else {
        const safeRange = normalizeAyatRange(formData.ayatMulai, formData.ayatSelesai, currentMax);
        rincianCapaian = `${formData.namaSurat}, Ayat ${safeRange.ayatMulai}-${safeRange.ayatSelesai}`;
        if (formData.adaSuratKedua && formData.namaSurat2) {
          const safeRange2 = normalizeAyatRange(formData.ayatMulai2, formData.ayatSelesai2, getMaxAyatSurat2());
          rincianCapaian += ` & Pindah ke ${formData.namaSurat2}, Ayat ${safeRange2.ayatMulai}-${safeRange2.ayatSelesai}`;
        }
      }
    } else {
      rincianCapaian = `Tidak Hadir (${formData.kehadiran})`;
    }

    const payloadItem = {
      id: editingId ? editingId : createRecordId(),
      namaAnak: formData.namaAnak.trim().toLowerCase(),
      namaAsli: formData.namaAnak.trim(),
      halaqoh: formData.namaHalaqoh,
      tanggal: formData.tanggal,
      hari: formData.hari,
      pekanLabel: getPekanLabel(formData.tanggal),
      hadir: formData.kehadiran,
      jenisSetoran: isHadir ? formData.jenisSetoran : `-`,
      rincianCapaian: rincianCapaian,
      predikat: isHadir ? (isTidakSetoran ? '-' : formData.predikat) : formData.kehadiran,
      skorAdab: totalAdab,
      skorCapaian: isTidakSetoran ? 0 : totalCapaian * 3,
      totalSkorPoin: totalAdab + (isTidakSetoran ? 0 : totalCapaian * 3),
      evaluasiBacaan: (isHadir && !isTidakSetoran) ? {
        makhrajSifat: formData.evalMakhrajSifat,
        tajwidMad: formData.evalTajwidMad,
        kelancaranKefasihan: formData.evalKelancaranKefasihan,
        catatan: formData.catatanSetoran
      } : null,
      createdBy: getCurrentUserId(),
      updatedBy: getCurrentUserId(),
    };

    const saved = await upsertSupabaseRow('riwayat', payloadItem);
    if (!saved) {
      alert('Data mutabaah gagal disimpan ke database pusat. Periksa koneksi lalu coba lagi.');
      return;
    }

    if (editingId) {
      setRiwayat(prev => prev.map(item => item.id === editingId ? payloadItem : item));
      setEditingId(null);
      alert('Data mutabaah berhasil diperbarui/dikoreksi!');
    } else {
      setRiwayat(prev => [...prev, payloadItem]);
      alert('Data mutabaah berhasil disimpan!');
    }

    await loadCentralData();

    const targetHalaqoh = currentUser.role === 'guru' ? currentUser.halaqoh : firstHalaqohKey;
    const defaultH = getInitialHari();
    const todayDate = getTodayDateStr();
    setFormData({
      namaHalaqoh: targetHalaqoh,
      namaAnak: manageHalaqohData[targetHalaqoh]?.[0] || '',
      ustadz: manageGuruPengampu[targetHalaqoh] || '',
      tanggal: todayDate,
      hari: defaultH,
      kehadiran: 'Hadir',
      
      datangTepatWaktu: false,
      memakaiSongkok: false,
      penampilanRapi: false,
      menjawabSalam: false,
      menghormatiGuru: false,
      fokusHafalan: false,
      tidakNgantuk: false,
      tidakMainMain: false,
      berusahaHafalan: false,
      suaraJelasTerdengar: false,

      sudahSetoran: false,
      mencapaiTarget: false,
      sudahMurojaahMandiri: false,
      sudahTahsin: false,

      jenisSetoran: 'Ziyadah (Hafalan Baru)',
      namaSurat: 'Al-Mulk',
      namaTamhidi: 'Tamhidi Jilid 1',
      namaJuz: 'Juz 30',
      ayatMulai: '',
      ayatSelesai: '',
      adaSuratKedua: false,
      namaSurat2: 'Al-Mulk',
      ayatMulai2: '',
      ayatSelesai2: '',
      predikat: 'Qowy (Kuat)',

      evalMakhrajSifat: 'Qowy (Kuat)',
      evalTajwidMad: 'Qowy (Kuat)',
      evalKelancaranKefasihan: 'Qowy (Kuat)',
      catatanSetoran: '',
    });

    requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-scroll-area');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleUklSubmit = async (e) => {
    e.preventDefault();

    const muridDiHalaqoh = manageHalaqohData[uklData.namaHalaqoh]?.includes(uklData.namaAnak);
    if (!muridDiHalaqoh) {
      alert('Nama murid UKL tidak terdaftar pada halaqoh yang dipilih. Silakan pilih ulang agar data tidak tertukar.');
      return;
    }

    const uklItem = {
      id: createRecordId(),
      namaKey: uklData.namaAnak.trim().toLowerCase(),
      namaAsli: uklData.namaAnak.trim(),
      ...uklData,
      createdBy: getCurrentUserId(),
      updatedBy: getCurrentUserId()
    };

    const saved = await upsertSupabaseRow('riwayat_ukl', uklItem);
    if (!saved) {
      alert('Data UKL gagal disimpan ke database pusat. Periksa koneksi lalu coba lagi.');
      return;
    }

    setRiwayatUkl(prev => [...prev, uklItem]);
    await loadCentralData();

    const defaultH = getInitialHari();
    const todayDate = getTodayDateStr();
    setUklData({
      namaHalaqoh: firstHalaqohKey,
      namaAnak: manageHalaqohData[firstHalaqohKey]?.[0] || '',
      jenisUjian: 'Kenaikan Jilid Tamhidi',
      materiUjian: 'Tamhidi Jilid 1',
      penguji: manageGuruPengampu[firstHalaqohKey] || '',
      tanggal: todayDate,
      hasilUjian: 'Lulus (Naik Level)',
      catatanUjian: '',
    });

    requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-scroll-area');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    alert('Data Ujian Kenaikan Level berhasil disimpan! Sertifikat kelulusan kini tersedia untuk diunduh.');
  };

  const handleAbsensiGuruSubmit = async (e) => {
    e.preventDefault();
    const absensiItem = {
      id: createRecordId(),
      ...absensiGuruData,
      createdBy: getCurrentUserId(),
      updatedBy: getCurrentUserId()
    };

    const saved = await upsertSupabaseRow('riwayat_absensi_guru', absensiItem);
    if (!saved) {
      alert('Data absensi pengampu gagal disimpan ke database pusat. Periksa koneksi lalu coba lagi.');
      return;
    }

    setRiwayatAbsensiGuru(prev => [...prev, absensiItem]);
    await loadCentralData();

    const defaultHalaqoh = currentUser.role === 'guru' ? currentUser.halaqoh : firstHalaqohKey;
    const defaultH = getInitialHari();
    const todayDate = getTodayDateStr();
    setAbsensiGuruData({
      namaHalaqoh: defaultHalaqoh,
      ustadz: manageGuruPengampu[defaultHalaqoh] || '',
      tanggal: todayDate,
      hari: defaultH,
      pekan: getSimplePekan(todayDate),
      kehadiran: 'Hadir',
      keterangan: ''
    });

    requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-scroll-area');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    alert('Data absensi pengampu berhasil disimpan!');
  };

  const isLegacyPlaceholderRow = (item) =>
    item?.hadir === '-' &&
    item?.jenisSetoran === '-' &&
    item?.rincianCapaian === '-' &&
    item?.predikat === '-' &&
    Number(item?.skorAdab ?? 0) === 0 &&
    Number(item?.skorCapaian ?? 0) === 0 &&
    Number(item?.totalSkorPoin ?? 0) === 0;

  const scopedRiwayat = riwayat.filter((item) => {
    if (currentUser?.role === 'guru') {
      if (isLegacyPlaceholderRow(item)) return false;
      return item.halaqoh === currentUser?.halaqoh;
    }
    return true;
  });

  const totalMuridSemua = Object.values(manageHalaqohData).reduce((acc, list) => acc + list.length, 0);
  const totalPengampuSemua = Object.keys(manageGuruPengampu).length;
  const totalHalaqohSemua = Object.keys(manageHalaqohData).length;
  const totalSesiPekan = 4;

  const computeLeaderboard = (filteredRiwayatSource) => {
    const listUnik = [...new Set(filteredRiwayatSource.map(item => item.namaAnak))];
    return listUnik.map(namaKey => {
      const dataMurid = filteredRiwayatSource.filter(i => i.namaAnak === namaKey);
      const namaAsli = dataMurid[0].namaAsli;
      const totalPoin = dataMurid.reduce((acc, curr) => acc + curr.totalSkorPoin, 0);
      const totalHadir = dataMurid.filter(i => i.hadir === 'Hadir').length;
      const totalSetoranSurat = dataMurid.filter(i => i.jenisSetoran !== '-' && i.jenisSetoran !== 'Tidak Setoran (Hadir Saja)').length;
      const halaqohAnak = dataMurid[0].halaqoh;
      return { namaKey, namaAsli, totalPoin, totalHadir, totalSetoranSurat, dataMurid, halaqohAnak };
    }).sort((a, b) => b.totalPoin - a.totalPoin);
  };

  const todayRiwayat = scopedRiwayat.filter(i => i.tanggal === todayDateStr);
  const leaderboardToday = computeLeaderboard(todayRiwayat);
  const leaderboardAllTime = computeLeaderboard(scopedRiwayat);

  const filteredPortalRiwayat = riwayat.filter((item) => {
    if (portalPeriodeFilter === 'hari' && portalFilterHari) return item.hari === portalFilterHari;
    if (portalPeriodeFilter === 'tanggal' && portalFilterTanggal) return item.tanggal === portalFilterTanggal;
    if (portalPeriodeFilter === 'pekan' && portalFilterPekan) {
      const pekanLabel = item.pekanLabel || getPekanLabel(item.tanggal);
      return pekanLabel.includes(portalFilterPekan);
    }
    if (portalPeriodeFilter === 'bulan' && portalFilterBulan) return String(item.tanggal || '').startsWith(portalFilterBulan);
    return true;
  });

  const leaderboardPortalToday = computeLeaderboard(riwayat.filter(i => i.tanggal === todayDateStr));
  const leaderboardPortalAllTime = computeLeaderboard(filteredPortalRiwayat);
  const selectedMuridData = leaderboardPortalAllTime.find(m => m.namaKey === searchOrangTua.trim().toLowerCase());
  const peringkatMurid = selectedMuridData ? leaderboardPortalAllTime.findIndex(m => m.namaKey === selectedMuridData.namaKey) + 1 : 0;

  const semuaSiswaList = Object.entries(manageHalaqohData).flatMap(([namaHalaqoh, muridList]) => 
    muridList.map(namaMurid => ({
      nama: namaMurid,
      halaqoh: namaHalaqoh,
      pengampu: manageGuruPengampu[namaHalaqoh] || '-',
      nisn: storedStudentDetails[namaMurid]?.nisn || '-',
      kelas: storedStudentDetails[namaMurid]?.kelas || 'Kelas 7',
      target: storedStudentDetails[namaMurid]?.target || '3 Juz'
    }))
  );

  const filteredSiswaList = semuaSiswaList.filter(s => 
    s.nama.toLowerCase().includes(searchMurid.toLowerCase()) || 
    s.nisn.toLowerCase().includes(searchMurid.toLowerCase()) ||
    s.kelas.toLowerCase().includes(searchMurid.toLowerCase()) ||
    s.halaqoh.toLowerCase().includes(searchMurid.toLowerCase()) ||
    s.pengampu.toLowerCase().includes(searchMurid.toLowerCase())
  );

  const halaqohChartStats = Object.keys(manageHalaqohData).map(hName => {
    const itemsInH = scopedRiwayat.filter(i => i.halaqoh === hName);
    const totalPts = itemsInH.reduce((acc, curr) => acc + curr.totalSkorPoin, 0);
    const totalHadirCount = itemsInH.filter(i => i.hadir === 'Hadir').length;
    return { halaqohName: hName, totalPts, totalHadirCount };
  });
  const maxPtsGraph = Math.max(...halaqohChartStats.map(s => s.totalPts), 30);

  const portalRecapByStudent = semuaSiswaList
    .map((siswa) => {
      const sRiwayat = filteredPortalRiwayat.filter(i => i.namaAnak === siswa.nama.toLowerCase());
      const totalSesiAnak = sRiwayat.length;
      const totalPoinAnak = sRiwayat.reduce((acc, curr) => acc + curr.totalSkorPoin, 0);
      const totalSetoranAnak = sRiwayat.filter(i => i.jenisSetoran !== '-' && i.jenisSetoran !== 'Tidak Setoran (Hadir Saja)').length;
      const avgAdab = totalSesiAnak > 0 ? (sRiwayat.reduce((a, c) => a + c.skorAdab, 0) / totalSesiAnak).toFixed(1) : '0';
      return { siswa, totalSesiAnak, totalPoinAnak, totalSetoranAnak, avgAdab };
    })
    .sort((a, b) => {
      if (b.totalSetoranAnak !== a.totalSetoranAnak) return b.totalSetoranAnak - a.totalSetoranAnak;
      if (b.totalPoinAnak !== a.totalPoinAnak) return b.totalPoinAnak - a.totalPoinAnak;
      return a.siswa.nama.localeCompare(b.siswa.nama);
    });

  const totalSesiTargetPortal = getTargetSesiByPeriode(portalPeriodeFilter);
  const totalSesiAktualPortal = filteredPortalRiwayat.filter((item) => item.hadir === 'Hadir').length;
  const persentaseSesiPortal = totalSesiTargetPortal > 0
    ? Math.min(100, Math.round((totalSesiAktualPortal / totalSesiTargetPortal) * 100))
    : 0;

  const filteredAbsensiRiwayat = riwayatAbsensiGuru
    .filter((item) => {
      if (absensiHalaqohFilter !== 'Semua' && item.namaHalaqoh !== absensiHalaqohFilter) return false;
      if (absensiPeriodeFilter === 'hari' && absensiFilterHari) return item.hari === absensiFilterHari;
      if (absensiPeriodeFilter === 'tanggal' && absensiFilterTanggal) return item.tanggal === absensiFilterTanggal;
      if (absensiPeriodeFilter === 'pekan' && absensiFilterPekan) {
        const pekanValue = item.pekan || getSimplePekan(item.tanggal);
        return pekanValue.includes(absensiFilterPekan);
      }
      if (absensiPeriodeFilter === 'bulan' && absensiFilterBulan) return String(item.tanggal || '').startsWith(absensiFilterBulan);
      return true;
    })
    .sort((a, b) => String(b.tanggal || '').localeCompare(String(a.tanggal || '')));

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-slate-900 font-sans flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-1 border border-slate-100 p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold tracking-wider px-3.5 py-1 rounded-full uppercase border border-blue-100">
              {schoolProfile.nama}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight pt-1">
              Mutaba'ah Digital
            </h1>
            <p className="text-sm text-slate-500 font-medium">Silakan masuk menggunakan akun Anda</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Pilih Akses Peran (Role)</label>
              <select 
                value={loginInput.roleSelect} 
                onChange={(e) => {
                  setLoginInput(prev => ({ ...prev, roleSelect: e.target.value }));
                  setLoginError('');
                }} 
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="admin">Super Admin</option>
                <option value="guru">Guru Pengampu / Ustadz / Ustadzah</option>
                <option value="kepsek">Kepala Sekolah</option>
                <option value="kurikulum">Bagian Kurikulum</option>
                <option value="kesiswaan">Bagian Kesiswaan</option>
                <option value="ortu">Wali Murid / Orang Tua</option>
              </select>
            </div>

            {loginInput.roleSelect !== 'ortu' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Username / ID Pengguna</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan Username / ID" 
                    value={loginInput.username}
                    onChange={(e) => {
                      setLoginInput(prev => ({ ...prev, username: e.target.value }));
                      setLoginError('');
                    }}
                    className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={loginInput.password}
                      onChange={(e) => {
                        setLoginInput(prev => ({ ...prev, password: e.target.value }));
                        setLoginError('');
                      }}
                      className="w-full p-3.5 pr-12 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243l4.242 4.242z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium text-center shadow-2xs">
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md mt-2 text-base">
              Masuk ke Sistem ➔
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Sistem Akademik Tahfidz • {schoolProfile.nama}
          </div>
        </div>
      </div>
    );
  }

  const dynamicNavItems = getBottomNavItems(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 text-white p-6 flex-col justify-between shrink-0 shadow-2xl z-10 border-r border-blue-950">
        <div className="space-y-6">
          <div className="bg-blue-800/50 p-4 rounded-2xl border border-blue-700/50 flex items-center gap-3.5 shadow-inner">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0 p-1 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="inline-block bg-blue-600/90 text-white text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded uppercase truncate max-w-[120px]">
                {schoolProfile.nama}
              </span>
              <h1 className="text-xs font-extrabold tracking-tight text-white leading-tight mt-1 whitespace-nowrap">
                Mutaba'ah Digital
              </h1>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm font-medium">
            {dynamicNavItems.map(item => (
              <button 
                key={item.key} 
                onClick={() => handleMenuChange(item.key)} 
                className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3.5 ${activeMenu === item.key ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-blue-100/80 hover:bg-blue-800/60 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-95 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-blue-800/60 space-y-3.5">
          <div className="text-xs text-blue-200/80">
            <p className="font-bold text-white text-sm">{currentUser.name}</p>
            <p className="capitalize text-xs text-blue-300">Peran: {currentUser.role}</p>
          </div>
          <button onClick={() => {
            setIsLoggedIn(false);
            setLoginInput({ username: '', password: '', roleSelect: 'admin' });
            setLoginError('');
          }} className="w-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold py-3 rounded-xl transition shadow-2xs">
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <header className="lg:hidden bg-white px-5 py-3.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs shrink-0 p-1 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider truncate max-w-[150px]">{schoolProfile.nama}</span>
              <h1 className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight whitespace-nowrap">Mutaba'ah Digital</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
            </div>
            <button onClick={() => {
              setIsLoggedIn(false);
              setLoginInput({ username: '', password: '', roleSelect: 'admin' });
              setLoginError('');
            }} className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 p-2 rounded-xl transition shadow-2xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <main id="main-scroll-area" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 pb-36 lg:pb-10 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100/50">

          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {currentUser.role === 'kepsek' 
                      ? 'Dashboard Eksekutif Kepala Sekolah' 
                      : currentUser.role === 'guru' 
                      ? `Dashboard ${currentUser.halaqoh}` 
                      : currentUser.role === 'kurikulum'
                      ? 'Dashboard Bagian Kurikulum'
                      : currentUser.role === 'kesiswaan'
                      ? 'Dashboard Bagian Kesiswaan'
                      : 'Dashboard Utama'}
                  </h2>
                  <p className="text-blue-100/90 text-sm mt-1 font-medium">
                    {currentUser.role === 'guru' 
                      ? `Pantau rekapitulasi setoran hafalan dan perkembangan murid di ${currentUser.halaqoh}.` 
                      : `Pantau rekapitulasi setoran hafalan, kehadiran, dan kedisiplinan murid secara real-time.`}
                  </p>
                </div>
                <div className="bg-blue-800/90 border border-blue-600/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-blue-100 shrink-0 shadow-inner flex items-center gap-2">
                  <span>📅 {todayFormatted}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </span>
                  <p className="text-sm font-medium text-blue-950 transition-all duration-300">
                    {broadcastList[currentBroadcastIdx] || "📢 Belum ada pengumuman aktif."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center ml-2">
                  {broadcastList.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentBroadcastIdx(i)}
                      className={`h-2 rounded-full transition-all ${currentBroadcastIdx === i ? 'w-5 bg-blue-600' : 'w-2 bg-blue-200'}`}
                    />
                  ))}
                </div>
              </div>

              {currentUser.role === 'admin' && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span>📢</span> Kelola Pesan Broadcast / Pengumuman
                  </h3>
                  <form onSubmit={handleAddBroadcast} className="flex flex-col sm:flex-row gap-2.5 text-sm">
                    <input 
                      type="text" 
                      placeholder="Ketik pengumuman baru..." 
                      value={newBroadcastInput}
                      onChange={(e) => setNewBroadcastInput(e.target.value)}
                      className="flex-1 p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                      required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3.5 rounded-xl transition shadow-xs shrink-0">
                      + Tambah Pengumuman
                    </button>
                  </form>
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-600 block">Daftar Pengumuman Aktif Saat Ini:</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {broadcastList.map((msg, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex justify-between items-center text-sm gap-2 shadow-2xs">
                          <span className="text-slate-700 font-medium">{idx + 1}. {msg}</span>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteBroadcast(idx)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-1.5 rounded-xl transition border border-rose-200 text-xs font-bold shrink-0 shadow-2xs"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser.role === 'guru' ? (
                  <>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Total Murid</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{manageHalaqohData[currentUser.halaqoh]?.length || 0}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Nama Halaqoh</span>
                        <span className="text-xs sm:text-sm font-extrabold text-blue-600 mt-1 block truncate">{currentUser.halaqoh}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Pengampu</span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 block truncate">{currentUser.name}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Sesi / Pekan</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{totalSesiPekan} Sesi</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Total Murid</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{totalMuridSemua}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Total Pengampu</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{totalPengampuSemua}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Total Halaqoh</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{totalHalaqohSemua}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block truncate">Sesi / Pekan</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">{totalSesiPekan} Sesi</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {currentUser.role === 'admin' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <span>👤</span> Tambah Murid Baru
                    </h3>
                    <form onSubmit={handleAddMurid} className="space-y-3.5 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Pilih Halaqoh Tujuan</label>
                          <select 
                            value={newMuridInput.halaqoh}
                            onChange={(e) => setNewMuridInput({ ...newMuridInput, halaqoh: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          >
                            {Object.keys(manageHalaqohData).map((h, i) => (
                              <option key={i} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Murid</label>
                          <input 
                            type="text" 
                            placeholder="Nama murid..." 
                            value={newMuridInput.nama}
                            onChange={(e) => setNewMuridInput({ ...newMuridInput, nama: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                          <input 
                            type="text" 
                            placeholder="Nomor NISN..." 
                            value={newMuridInput.nisn}
                            onChange={(e) => setNewMuridInput({ ...newMuridInput, nisn: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-mono shadow-2xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                          <select 
                            value={newMuridInput.kelas}
                            onChange={(e) => setNewMuridInput({ ...newMuridInput, kelas: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs"
                          >
                            <option value="Kelas 7">Kelas 7</option>
                            <option value="Kelas 8">Kelas 8</option>
                            <option value="Kelas 9">Kelas 9</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Target Hafalan</label>
                          <input 
                            type="text" 
                            value={newMuridInput.target}
                            onChange={(e) => setNewMuridInput({ ...newMuridInput, target: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-xs">
                        + Tambah Murid ke Sistem
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <span>🏛️</span> Kelola Halaqoh (Tambah & Hapus)
                    </h3>
                    <form onSubmit={handleAddHalaqoh} className="space-y-3.5 text-sm">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Halaqoh Baru</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: Halaqoh Al-Fatih..." 
                          value={newHalaqohInput}
                          onChange={(e) => setNewHalaqohInput(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs"
                          required
                        />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-xs">
                        + Buat Halaqoh Baru
                      </button>
                    </form>

                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <span className="text-xs font-bold text-slate-600 block">Daftar & Pengampu Halaqoh (Ubah / Hapus):</span>
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {Object.keys(manageHalaqohData).map((hName) => (
                          <div key={hName} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-2xs">
                            <span className="font-bold text-slate-800">{hName}</span>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input 
                                type="text" 
                                defaultValue={manageGuruPengampu[hName] || ''}
                                onBlur={(e) => handleUpdatePengampu(hName, e.target.value)}
                                className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs flex-1 sm:w-64 shadow-2xs"
                                placeholder="Nama pengampu..."
                              />
                              <button 
                                type="button"
                                onClick={() => handleDeleteHalaqoh(hName)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2.5 rounded-xl transition border border-rose-200 text-xs font-bold shrink-0 shadow-2xs"
                                title="Hapus Halaqoh Ini"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>📊</span> Statistik Akumulasi Poin per Halaqoh
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-bold">Real-time</span>
                  </div>
                  <p className="text-sm text-slate-500">Perbandingan total skor poin adab dan capaian hafalan antar kelompok halaqoh.</p>
                  
                  <div className="space-y-4 pt-2">
                    {halaqohChartStats.map((stat, idx) => {
                      const percentage = Math.round((stat.totalPts / maxPtsGraph) * 100);
                      const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'];
                      const barColor = colors[idx % colors.length];

                      return (
                        <div key={stat.halaqohName} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-700">{stat.halaqohName}</span>
                            <span className="font-extrabold text-slate-900">{stat.totalPts} Poin <span className="text-slate-400 font-normal">({stat.totalHadirCount} hadir)</span></span>
                          </div>
                          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>📈</span> Tren Kehadiran & Partisipasi Sesi
                    </h3>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl font-bold">Statistik Keaktifan</span>
                  </div>
                  <p className="text-sm text-slate-500">Persentase tingkat kehadiran murid secara kumulatif dari total input.</p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-2 shadow-2xs">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sesi Tercatat</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{riwayat.length} <span className="text-sm font-normal text-slate-500">Sesi</span></span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg inline-block w-fit">● Aktif Berjalan</span>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-2 shadow-2xs">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rata-rata Skor Adab</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                        {riwayat.length > 0 ? (riwayat.reduce((a, c) => a + c.skorAdab, 0) / riwayat.length).toFixed(1) : '0'} <span className="text-sm font-normal text-slate-500">/ 10</span>
                      </span>
                      <span className="text-xs text-blue-700 font-bold bg-blue-100/70 px-2.5 py-1 rounded-lg inline-block w-fit">★ Sangat Baik</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center gap-3.5 text-sm text-blue-950 font-medium">
                      <span className="text-xl">💡</span>
                      <p>Sistem pencatatan otomatis memperbarui grafik secara langsung setiap kali Ustadz/Ustadzah pengampu menyimpan data mutabaah harian.</p>
                    </div>
                  </div>
                </div>
              </div>

              {currentUser.role === 'guru' && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    👥 Daftar Data Murid di {currentUser.halaqoh}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {manageHalaqohData[currentUser.halaqoh]?.map((m, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col justify-between text-sm space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-slate-900">{idx + 1}. {m}</span>
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl font-bold shrink-0 whitespace-nowrap border border-emerald-200/60">{storedStudentDetails[m]?.kelas || '-'}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">NISN: {storedStudentDetails[m]?.nisn || '-'} | Target: {storedStudentDetails[m]?.target || '3 Juz'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🏆</span> Peringkat & Poin Hafalan Murid
                  </h3>
                </div>

                {leaderboardAllTime.length === 0 ? (
                  <p className="text-slate-400 text-sm py-6 text-center italic">Belum ada data nilai yang masuk untuk kategori ini.</p>
                ) : (
                  <div className="space-y-2.5">
                    {leaderboardAllTime
                      .filter(m => currentUser.role !== 'guru' || m.halaqohAnak === currentUser.halaqoh)
                      .slice(0, 15)
                      .map((m, idx) => (
                        <div key={m.namaKey} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 text-sm gap-3 transition shadow-2xs">
                          <div className="flex items-center gap-3.5 flex-wrap">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs shrink-0 shadow-2xs ${idx === 0 ? 'bg-amber-400 text-amber-950 font-black' : idx === 1 ? 'bg-slate-300 text-slate-800 font-bold' : idx === 2 ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}>
                              {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 capitalize block">{m.namaAsli}</span>
                              <span className="text-xs text-slate-500 font-medium">{m.halaqohAnak}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs self-end sm:self-auto font-medium">
                            <span className="text-slate-600">Hadir: <b className="text-slate-900">{m.totalHadir} sesi</b></span>
                            <span className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-xs">Poin: {m.totalPoin}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'input' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <h2 className="text-base font-bold text-slate-900">
                    {editingId ? "✏️ Koreksi / Edit Data Mutabaah Harian" : "📝 Input Mutabaah Harian Murid"}
                  </h2>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingId(null);
                        alert('Mode edit dibatalkan.');
                      }}
                      className="text-xs bg-rose-50 text-rose-600 px-3.5 py-1.5 rounded-xl border border-rose-200 font-bold shadow-2xs"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Halaqoh</label>
                      {currentUser.role === 'guru' ? (
                        <input 
                          type="text" 
                          value={formData.namaHalaqoh} 
                          readOnly 
                          className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-slate-800 text-sm shadow-2xs" 
                        />
                      ) : (
                        <select 
                          name="namaHalaqoh" 
                          value={formData.namaHalaqoh} 
                          onChange={handleChange} 
                          className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs"
                        >
                          {Object.keys(manageHalaqohData).map((namaHalaqoh, idx) => (
                            <option key={idx} value={namaHalaqoh}>{namaHalaqoh}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Murid</label>
                      <select name="namaAnak" value={formData.namaAnak} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs" required>
                        {manageHalaqohData[formData.namaHalaqoh]?.map((nama, idx) => (
                          <option key={idx} value={nama}>{nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pengampu</label>
                      <input type="text" name="ustadz" value={formData.ustadz} readOnly className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-slate-700 capitalize text-sm shadow-2xs truncate" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tgl (Otomatis)</label>
                      <input type="date" name="tanggal" value={formData.tanggal || initialFormDate} onChange={handleChange} className="w-full px-3 py-3.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Hari Tahfidz</label>
                      <select name="hari" value={formData.hari} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-blue-600 text-sm shadow-2xs">
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kehadiran</label>
                      <select name="kehadiran" value={formData.kehadiran} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-sm shadow-2xs">
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alpha">Alpha</option>
                      </select>
                    </div>
                  </div>

                  {formData.kehadiran === 'Hadir' ? (
                    <>
                      <hr className="border-slate-100 my-2" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Jenis Setoran</label>
                          <select name="jenisSetoran" value={formData.jenisSetoran} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold shadow-2xs">
                            <option value="Ziyadah (Hafalan Baru)">Ziyadah (Hafalan Baru)</option>
                            <option value="Murajaah (Hafalan Lama)">Murajaah (Hafalan Lama)</option>
                            <option value="Tahsin (Perbaikan Bacaan)">Tahsin (Perbaikan Bacaan)</option>
                            <option value="Tamhidi">Tamhidi</option>
                            <option value="Tasmi' 1 Juz">Tasmi' 1 Juz</option>
                            <option value="Tidak Setoran (Hadir Saja)">Tidak Setoran (Hadir Saja)</option>
                          </select>
                        </div>

                        {!isTidakSetoran && (
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              {isTamhidi ? "Pilih Jilid Tamhidi" : isTasmiJuz ? "Pilih Juz" : "Pilih Surat"}
                            </label>
                            <select name={isTamhidi ? "namaTamhidi" : isTasmiJuz ? "namaJuz" : "namaSurat"} value={isTamhidi ? formData.namaTamhidi : isTasmiJuz ? formData.namaJuz : formData.namaSurat} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-extrabold text-blue-600 shadow-2xs">
                              {isTamhidi ? daftarTamhidi.map((i, idx) => <option key={idx} value={i}>{i}</option>) : isTasmiJuz ? daftarJuz.map((j, idx) => <option key={idx} value={j}>{j}</option>) : daftarSurat.map((s, idx) => <option key={idx} value={s}>{s} ({jumlahAyatSurah[s]} ayat)</option>)}
                            </select>
                          </div>
                        )}
                      </div>

                      {isTidakSetoran && (
                        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                          <label className="block font-bold text-amber-900 text-xs uppercase tracking-wider">Catatan / Alasan Hadir Tanpa Setoran:</label>
                          <input 
                            type="text" 
                            name="catatanSetoran" 
                            placeholder="Contoh: Mengikuti kegiatan sekolah / Sakit ringan di kelas..." 
                            value={formData.catatanSetoran} 
                            onChange={handleChange} 
                            className="w-full p-3.5 rounded-xl border border-amber-300 bg-white font-medium text-slate-800 text-sm shadow-2xs" 
                          />
                        </div>
                      )}

                      {!isTasmiJuz && !isTidakSetoran && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <label className="font-semibold text-slate-700 truncate">{isTamhidi ? "Dari Halaman" : "Dari Ayat"}</label>
                              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg shrink-0">Maks: {getMaxAyatCurrent()}</span>
                            </div>
                            <input 
                              type="number" 
                              name="ayatMulai" 
                              min="1" 
                              max={getMaxAyatCurrent()} 
                              placeholder="1" 
                              value={formData.ayatMulai} 
                              onChange={handleChange} 
                              className="w-full p-3.5 rounded-xl border border-slate-300 font-bold shadow-2xs" 
                              required 
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <label className="font-semibold text-slate-700 truncate">{isTamhidi ? "Sampai Halaman" : "Sampai Ayat"}</label>
                              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg shrink-0">Maks: {getMaxAyatCurrent()}</span>
                            </div>
                            <input 
                              type="number" 
                              name="ayatSelesai" 
                              min="1" 
                              max={getMaxAyatCurrent()} 
                              placeholder={getMaxAyatCurrent()} 
                              value={formData.ayatSelesai} 
                              onChange={handleChange} 
                              className="w-full p-3.5 rounded-xl border border-slate-300 font-bold shadow-2xs" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Predikat</label>
                            <select name="predikat" value={formData.predikat} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold shadow-2xs">
                              <option value="Qowy (Kuat)">Qowy (Kuat)</option>
                              <option value="Mutawassith (Pertengahan)">Mutawassith (Pertengahan)</option>
                              <option value="Dhoif (Lemah)">Dhoif (Lemah)</option>
                            </select>
                          </div>

                          {!isTahsinOrTamhidi && (
                            <div className="md:col-span-3 pt-1">
                              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <input type="checkbox" name="adaSuratKedua" checked={formData.adaSuratKedua} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="font-bold text-slate-800 text-sm">Setoran lebih dari satu surat / sampai surat lanjutan pada sesi ini</span>
                              </label>
                            </div>
                          )}

                          {formData.adaSuratKedua && !isTahsinOrTamhidi && (
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3.5 p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                              <div className="md:col-span-3">
                                <label className="block font-semibold text-slate-700 mb-1">Sampai Surat / Lanjutan</label>
                                <select name="namaSurat2" value={formData.namaSurat2} onChange={handleChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-blue-600 shadow-2xs">
                                  {daftarSurat.map((s, idx) => <option key={idx} value={s}>{s} ({jumlahAyatSurah[s]} ayat)</option>)}
                                </select>
                              </div>
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <label className="font-semibold text-slate-700 truncate">Dari Ayat</label>
                                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg shrink-0">Maks: {getMaxAyatSurat2()}</span>
                                </div>
                                <input 
                                  type="number" 
                                  name="ayatMulai2" 
                                  min="1" 
                                  max={getMaxAyatSurat2()} 
                                  placeholder="1" 
                                  value={formData.ayatMulai2} 
                                  onChange={handleChange} 
                                  className="w-full p-3.5 rounded-xl border border-slate-300 font-bold bg-white shadow-2xs" 
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <label className="font-semibold text-slate-700 truncate">Sampai Ayat</label>
                                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg shrink-0">Maks: {getMaxAyatSurat2()}</span>
                                </div>
                                <input 
                                  type="number" 
                                  name="ayatSelesai2" 
                                  min="1" 
                                  max={getMaxAyatSurat2()} 
                                  placeholder={getMaxAyatSurat2()} 
                                  value={formData.ayatSelesai2} 
                                  onChange={handleChange} 
                                  className="w-full p-3.5 rounded-xl border border-slate-300 font-bold bg-white shadow-2xs" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <hr className="border-slate-100 my-2" />

                      {!isTidakSetoran && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
                          <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">📋 Penilaian Bacaan & Setoran</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                            <div className="flex flex-col h-full justify-end">
                              <label className="block font-semibold text-slate-700 mb-1">Makhraj & Sifat</label>
                              <select name="evalMakhrajSifat" value={formData.evalMakhrajSifat} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs">
                                <option value="Qowy (Kuat)">Qowy (Kuat)</option>
                                <option value="Mutawassith (Pertengahan)">Mutawassith (Pertengahan)</option>
                                <option value="Dhoif (Lemah)">Dhoif (Lemah)</option>
                              </select>
                            </div>
                            <div className="flex flex-col h-full justify-end">
                              <label className="block font-semibold text-slate-700 mb-1">Tajwid & Mad</label>
                              <select name="evalTajwidMad" value={formData.evalTajwidMad} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs">
                                <option value="Qowy (Kuat)">Qowy (Kuat)</option>
                                <option value="Mutawassith (Pertengahan)">Mutawassith (Pertengahan)</option>
                                <option value="Dhoif (Lemah)">Dhoif (Lemah)</option>
                              </select>
                            </div>
                            <div className="flex flex-col h-full justify-end">
                              <label className="block font-semibold text-slate-700 mb-1">Kelancaran</label>
                              <select name="evalKelancaranKefasihan" value={formData.evalKelancaranKefasihan} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs">
                                <option value="Qowy (Kuat)">Qowy (Kuat)</option>
                                <option value="Mutawassith (Pertengahan)">Mutawassith (Pertengahan)</option>
                                <option value="Dhoif (Lemah)">Dhoif (Lemah)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                            <textarea name="catatanSetoran" placeholder="Catatan khusus bacaan..." value={formData.catatanSetoran} onChange={handleChange} rows="2" className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"></textarea>
                          </div>
                        </div>
                      )}

                      {!isTidakSetoran && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
                          <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">✅ Checklist Capaian Target Harian</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {isTahsinOrTamhidi ? (
                              <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-2 shadow-2xs">
                                <input type="checkbox" name="sudahTahsin" checked={formData.sudahTahsin} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="font-bold text-slate-800">Sudah Mengikuti Sesi Tahsin / Tamhidi</span>
                              </label>
                            ) : (
                              <>
                                <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <input type="checkbox" name="sudahSetoran" checked={formData.sudahSetoran} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                  <span className="font-bold text-slate-800">Sudah Melakukan Setoran</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <input type="checkbox" name="mencapaiTarget" checked={formData.mencapaiTarget} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                  <span className="font-bold text-slate-800">Mencapai Target Hafalan</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-2 shadow-2xs">
                                  <input type="checkbox" name="sudahMurojaahMandiri" checked={formData.sudahMurojaahMandiri} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                  <span className="font-bold text-slate-800">Sudah Murojaah Mandiri</span>
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
                        <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">✨ Adab & Kedisiplinan Murid (10 Poin)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="datangTepatWaktu" checked={formData.datangTepatWaktu} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Datang Tepat Waktu</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="memakaiSongkok" checked={formData.memakaiSongkok} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Memakai Songkok</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="penampilanRapi" checked={formData.penampilanRapi} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Penampilan Rapi</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="menjawabSalam" checked={formData.menjawabSalam} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Menjawab Salam</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="menghormatiGuru" checked={formData.menghormatiGuru} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Menghormati Ustadz/ah</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="fokusHafalan" checked={formData.fokusHafalan} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Fokus Menghafal</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="tidakNgantuk" checked={formData.tidakNgantuk} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Tidak Ngantuk</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="tidakMainMain" checked={formData.tidakMainMain} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Tidak Main-main</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="berusahaHafalan" checked={formData.berusahaHafalan} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Berusaha Maksimal</span></label>
                          <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><input type="checkbox" name="suaraJelasTerdengar" checked={formData.suaraJelasTerdengar} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="font-medium text-slate-800">Suara Jelas Terdengar</span></label>
                        </div>
                      </div>
                    </>
                  ) : null}

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md mt-4 text-base">
                    {editingId ? "Simpan Perubahan Koreksi" : "Simpan Data Mutabaah"}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">📊 Informasi Sistem</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Validasi batas maksimal ayat aktif melindungi kesalahan pengisian nomor ayat melebihi jumlah ayat surah yang sebenarnya.
                  </p>
                </div>

                {Object.entries(manageHalaqohData)
                  .filter(([namaHalaqoh]) => currentUser.role !== 'guru' || namaHalaqoh === currentUser.halaqoh)
                  .map(([namaHalaqoh, listMurid]) => (
                    <div key={namaHalaqoh} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <h3 className="text-sm font-bold text-slate-900">{namaHalaqoh}</h3>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">{listMurid.length} Murid</span>
                      </div>
                      <div className="bg-blue-50/80 border border-blue-200 px-4 py-3 rounded-2xl shadow-2xs">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Pengampu</span>
                        <span className="text-sm font-extrabold text-blue-700">{manageGuruPengampu[namaHalaqoh] || 'Belum ditentukan'}</span>
                      </div>
                      <ul className="text-sm text-slate-700 space-y-2 max-h-52 overflow-y-auto pr-1">
                        {listMurid.map((m, i) => (
                          <li key={i} className="py-2.5 px-3.5 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-200/60 gap-2 shadow-2xs">
                            <span className="text-slate-800 font-bold truncate">{i + 1}. {m}</span>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="text-xs text-slate-600 font-bold whitespace-nowrap">{storedStudentDetails[m]?.kelas || ''}</span>
                              {currentUser.role === 'admin' && (
                                <button 
                                  onClick={() => handleDeleteMurid(namaHalaqoh, m)} 
                                  title="Hapus Murid" 
                                  className="text-rose-600 hover:text-rose-800 text-xs bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 font-bold shadow-2xs"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeMenu === 'riwayat' && (() => {
            const filteredRiwayat = filterRiwayatRows(
              riwayat,
              currentUser,
              adminHalaqohFilter,
              adminPeriodeFilter,
              adminFilterHari,
              adminFilterTanggal,
              adminFilterPekan,
              adminFilterBulan
            );

            const halaqohGroups = Object.keys(manageHalaqohData).reduce((acc, hName) => {
              acc[hName] = filteredRiwayat.filter(item => item.halaqoh === hName);
              return acc;
            }, {});

            const canFilter = ['admin', 'guru', 'kepsek', 'kurikulum', 'kesiswaan'].includes(currentUser.role);

            return (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {currentUser.role === 'guru' ? '📂 Riwayat Aktivitas Semua Halaqoh' : '📂 Riwayat Pencapaian Harian & Rekapitulasi Halaqoh'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Kelompok halaqoh & filter rekapitulasi harian, pekan, dan bulan</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto shrink-0">
                    {currentUser.role === 'admin' && (
                      <button 
                        onClick={handleExportExcel}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4.5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer"
                      >
                        📊 Ekspor ke Excel (.xls)
                      </button>
                    )}
                    <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-900 shadow-2xs flex items-center justify-center gap-2 w-full md:w-auto shrink-0">
                      <span>📅 {todayFormatted}</span>
                    </div>
                  </div>
                </div>

                {canFilter && (
                  <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200/80 space-y-4 text-sm shadow-2xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="font-bold text-slate-800">🔍 Filter Rekapitulasi & Grup Halaqoh:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => setAdminPeriodeFilter('semua')}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminPeriodeFilter === 'semua' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        >
                          Semua Waktu
                        </button>
                        <button 
                          onClick={() => setAdminPeriodeFilter('hari')}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminPeriodeFilter === 'hari' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        >
                          Berdasarkan Hari
                        </button>
                        <button 
                          onClick={() => setAdminPeriodeFilter('tanggal')}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminPeriodeFilter === 'tanggal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        >
                          Berdasarkan Tanggal
                        </button>
                        <button 
                          onClick={() => setAdminPeriodeFilter('pekan')}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminPeriodeFilter === 'pekan' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        >
                          Berdasarkan Pekan
                        </button>
                        <button 
                          onClick={() => setAdminPeriodeFilter('bulan')}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminPeriodeFilter === 'bulan' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        >
                          Berdasarkan Bulan
                        </button>
                      </div>
                    </div>

                    {adminPeriodeFilter === 'hari' && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Pilih Hari:</span>
                        <select 
                          value={adminFilterHari} 
                          onChange={(e) => setAdminFilterHari(e.target.value)} 
                          className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs"
                        >
                          <option value="">Semua Hari</option>
                          <option value="Senin">Senin</option>
                          <option value="Selasa">Selasa</option>
                          <option value="Rabu">Rabu</option>
                          <option value="Kamis">Kamis</option>
                          <option value="Jumat">Jumat</option>
                          <option value="Sabtu">Sabtu</option>
                          <option value="Minggu">Minggu</option>
                        </select>
                      </div>
                    )}

                    {adminPeriodeFilter === 'tanggal' && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Pilih Tanggal:</span>
                        <input 
                          type="date" 
                          value={adminFilterTanggal} 
                          onChange={(e) => setAdminFilterTanggal(e.target.value)} 
                          className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs"
                        />
                        {adminFilterTanggal && (
                          <button onClick={() => setAdminFilterTanggal('')} className="text-rose-600 font-bold hover:underline">Reset Tanggal</button>
                        )}
                      </div>
                    )}

                    {adminPeriodeFilter === 'pekan' && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Pilih Pekan:</span>
                        <select 
                          value={adminFilterPekan} 
                          onChange={(e) => setAdminFilterPekan(e.target.value)} 
                          className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs"
                        >
                          <option value="">Semua Pekan</option>
                          <option value="Pekan 1">Pekan 1</option>
                          <option value="Pekan 2">Pekan 2</option>
                          <option value="Pekan 3">Pekan 3</option>
                          <option value="Pekan 4">Pekan 4</option>
                        </select>
                      </div>
                    )}

                    {adminPeriodeFilter === 'bulan' && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Pilih Bulan (YYYY-MM):</span>
                        <input 
                          type="month" 
                          value={adminFilterBulan} 
                          onChange={(e) => setAdminFilterBulan(e.target.value)} 
                          className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs"
                        />
                        {adminFilterBulan && (
                          <button onClick={() => setAdminFilterBulan('')} className="text-rose-600 font-bold hover:underline">Reset Bulan</button>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-slate-700 mr-2">Pilih Halaqoh:</span>
                      <button 
                        onClick={() => setAdminHalaqohFilter('Semua')}
                        className={`px-4 py-2 rounded-xl font-bold transition ${adminHalaqohFilter === 'Semua' ? 'bg-indigo-700 text-white shadow-xs' : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'}`}
                      >
                        Semua Halaqoh
                      </button>
                      {Object.keys(manageHalaqohData).map(hName => (
                        <button 
                          key={hName}
                          onClick={() => setAdminHalaqohFilter(hName)}
                          className={`px-4 py-2 rounded-xl font-bold transition ${adminHalaqohFilter === hName ? 'bg-indigo-700 text-white shadow-xs' : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'}`}
                        >
                          {hName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredRiwayat.length === 0 ? (
                  <p className="text-slate-400 text-sm py-10 text-center italic bg-slate-50 rounded-3xl border border-slate-100">Belum ada data mutabaah tersimpan yang sesuai dengan filter.</p>
                ) : canFilter && adminHalaqohFilter === 'Semua' ? (
                  <div className="space-y-8">
                    {Object.entries(halaqohGroups).map(([halaqohName, items]) => {
                      if (items.length === 0) return null;

                      const pekanSubGroups = items.reduce((acc, curr) => {
                        const pLabel = curr.pekanLabel || getPekanLabel(curr.tanggal);
                        if (!acc[pLabel]) acc[pLabel] = [];
                        acc[pLabel].push(curr);
                        return acc;
                      }, {});

                      return (
                        <div key={halaqohName} className="bg-slate-50/70 p-5 sm:p-6 rounded-3xl border border-blue-200/80 space-y-4 shadow-2xs">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-blue-900 pb-3">
                            <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                              <span>🏛️</span> {halaqohName} <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-md font-bold">({items.length} Data Total)</span>
                            </h3>
                            <button 
                              onClick={() => setAdminHalaqohFilter(halaqohName)}
                              className="text-xs text-blue-700 font-bold hover:underline shrink-0"
                            >
                              Fokus Kelompok Ini ➔
                            </button>
                          </div>

                          {Object.entries(pekanSubGroups).map(([pekanTitle, pekanItems]) => (
                            <div key={pekanTitle} className="bg-white p-5 rounded-2xl border border-blue-100 space-y-3.5 shadow-xs">
                              <h4 className="text-xs font-extrabold text-blue-800 italic border-b border-slate-100 pb-2.5">
                                📌 Laporan Rekapan Otomatis: {pekanTitle}
                              </h4>
                              <div className="overflow-x-auto text-sm">
                                <table className="w-full text-left min-w-[700px]">
                                  <thead>
                                    <tr className="bg-blue-50/80 text-slate-800 font-bold border-b border-blue-200 whitespace-nowrap">
                                      <th className="p-3.5 rounded-l-xl">Nama Murid</th>
                                      <th className="p-3.5">Tgl</th>
                                      <th className="p-3.5">Kehadiran</th>
                                      <th className="p-3.5">Skor Adab</th>
                                      <th className="p-3.5">Pencapaian</th>
                                      <th className="p-3.5">Predikat</th>
                                      <th className="p-3.5 rounded-r-xl text-center w-32">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {pekanItems.map((item) => (
                                      <tr key={item.id} className="hover:bg-slate-50/80">
                                        <td className="p-3.5 align-middle font-bold text-slate-900 capitalize whitespace-nowrap">{item.namaAsli}</td>
                                        <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap"><div className="font-semibold">{formatDateDisplay(item.tanggal)}</div><div className="text-xs text-slate-400">({item.hari})</div></td>
                                        <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">{item.hadir}</span></td>
                                        <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800">{item.skorAdab}/10</span></td>
                                        <td className="p-3.5 align-middle text-slate-700"><span className="font-bold text-blue-700">{item.jenisSetoran}</span>: {item.rincianCapaian}</td>
                                        <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-800 border border-blue-200">{item.predikat}</span></td>
                                        <td className="p-3.5 align-middle text-center whitespace-nowrap">
                                          <div className="inline-flex items-center justify-center gap-2">
                                            <button onClick={() => handleSendWhatsApp(item)} title="Kirim via WhatsApp" className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition shadow-2xs">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                              </svg>
                                            </button>
                                            {['admin', 'guru'].includes(currentUser.role) && (
                                              <>
                                                <button onClick={() => handleEditItem(item)} title="Edit / Koreksi" className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-2xs">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                  </svg>
                                                </button>
                                                <button onClick={() => hapusRiwayatItem(item.id)} title="Hapus" className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                  </svg>
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <span className="font-bold text-blue-900 text-sm">Menampilkan Rekap untuk: {currentUser.role === 'guru' ? currentUser.halaqoh : adminHalaqohFilter}</span>
                      {canFilter && adminHalaqohFilter !== 'Semua' && (
                        <button onClick={() => setAdminHalaqohFilter('Semua')} className="text-blue-600 font-bold hover:underline text-xs">Tampilkan Semua Halaqoh</button>
                      )}
                    </div>

                    {(() => {
                      const activeHalaqohFilteredItems = filteredRiwayat;
                      const pekanSubGroups = activeHalaqohFilteredItems.reduce((acc, curr) => {
                        const pLabel = curr.pekanLabel || getPekanLabel(curr.tanggal);
                        if (!acc[pLabel]) acc[pLabel] = [];
                        acc[pLabel].push(curr);
                        return acc;
                      }, {});

                      return Object.entries(pekanSubGroups).map(([pekanTitle, pekanItems]) => (
                        <div key={pekanTitle} className="bg-white p-5 rounded-3xl border border-blue-100 space-y-3.5 shadow-2xs">
                          <h4 className="text-xs font-bold text-blue-800 italic border-b border-slate-100 pb-2.5">
                            📌 Laporan Rekapan Otomatis: {pekanTitle}
                          </h4>
                          <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left min-w-[700px]">
                              <thead>
                                <tr className="bg-blue-50/80 text-slate-800 font-bold border-b border-blue-200 whitespace-nowrap">
                                  <th className="p-3.5 rounded-l-xl">Nama Murid</th>
                                  <th className="p-3.5">Halaqoh</th>
                                  <th className="p-3.5">Tgl</th>
                                  <th className="p-3.5">Kehadiran</th>
                                  <th className="p-3.5">Skor Adab</th>
                                  <th className="p-3.5">Pencapaian</th>
                                  <th className="p-3.5">Predikat</th>
                                  <th className="p-3.5 rounded-r-xl text-center w-32">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {pekanItems.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/80">
                                    <td className="p-3.5 align-middle font-bold text-slate-900 capitalize whitespace-nowrap">{item.namaAsli}</td>
                                    <td className="p-3.5 align-middle text-slate-700 capitalize whitespace-nowrap">{item.halaqoh}</td>
                                    <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap"><div className="font-semibold">{formatDateDisplay(item.tanggal)}</div><div className="text-xs text-slate-400">({item.hari})</div></td>
                                    <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">{item.hadir}</span></td>
                                    <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800">{item.skorAdab}/10</span></td>
                                    <td className="p-3.5 align-middle text-slate-700"><span className="font-bold text-blue-700">{item.jenisSetoran}</span>: {item.rincianCapaian}</td>
                                    <td className="p-3.5 align-middle whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-800 border border-blue-200">{item.predikat}</span></td>
                                    <td className="p-3.5 align-middle text-center whitespace-nowrap">
                                      <div className="inline-flex items-center justify-center gap-2">
                                        <button onClick={() => handleSendWhatsApp(item)} title="Kirim via WhatsApp" className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition shadow-2xs">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                        </button>
                                        {['admin', 'guru'].includes(currentUser.role) ? (
                                          <>
                                            <button onClick={() => handleEditItem(item)} title="Edit / Koreksi" className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-2xs">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                            <button onClick={() => hapusRiwayatItem(item.id)} title="Hapus" className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          </>
                                        ) : null}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            );
          })()}

          {activeMenu === 'ukl' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-3.5 py-1 rounded-xl font-bold uppercase tracking-wider border border-blue-200">Modul Ujian & Kenaikan Level</span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-2">🏅 Ujian Kenaikan Level (UKL) & Tasmi'</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Kelola input penilaian ujian kenaikan jilid/juz serta riwayat kelulusan murid.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-slate-900 text-base">📝 Form Input Ujian Kenaikan Level</h3>
                  <form onSubmit={handleUklSubmit} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pilih Halaqoh</label>
                        <select name="namaHalaqoh" value={uklData.namaHalaqoh} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs">
                          {Object.keys(manageHalaqohData).map((h, idx) => <option key={idx} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pilih Murid</label>
                        <select name="namaAnak" value={uklData.namaAnak} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold shadow-2xs" required>
                          {manageHalaqohData[uklData.namaHalaqoh]?.map((n, idx) => <option key={idx} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jenis Ujian</label>
                        <select name="jenisUjian" value={uklData.jenisUjian} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold shadow-2xs">
                          <option value="Kenaikan Jilid Tamhidi">Kenaikan Jilid Tamhidi</option>
                          <option value="Kenaikan Juz Al-Qur'an">Kenaikan Juz Al-Qur'an</option>
                          <option value="Ujian Tasmi' 1 Juz">Ujian Tasmi' 1 Juz</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Materi Tujuan</label>
                        <select name="materiUjian" value={uklData.materiUjian} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-extrabold text-blue-600 shadow-2xs">
                          {uklData.jenisUjian === 'Kenaikan Jilid Tamhidi' ? daftarTamhidi.map((item, idx) => <option key={idx} value={item}>{item}</option>) : daftarJuz.map((juz, idx) => <option key={idx} value={juz}>{juz}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Penguji</label>
                        <select name="penguji" value={uklData.penguji} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs" required>
                          {daftarPenguji.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hasil</label>
                        <select name="hasilUjian" value={uklData.hasilUjian} onChange={handleUklChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-extrabold text-emerald-700 shadow-2xs">
                          <option value="Lulus (Naik Level)">Lulus (Naik Level)</option>
                          <option value="Lulus Bersyarat">Lulus Bersyarat</option>
                          <option value="Mengulang">Mengulang</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                      <textarea name="catatanUjian" placeholder="Catatan penguji..." value={uklData.catatanUjian} onChange={handleUklChange} rows="2" className="w-full p-3.5 rounded-xl border border-slate-300 shadow-2xs"></textarea>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md text-base">Simpan Ujian</button>
                  </form>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">📜 Riwayat Ujian & Unduh Sertifikat</h3>
                <p className="text-xs text-slate-500">Daftar seluruh hasil ujian kenaikan level. Unduh sertifikat penghargaan resmi berformat PDF bagi murid yang telah menyelesaikan ujian (khusus Admin).</p>
                {riwayatUkl.length === 0 ? (
                  <p className="text-slate-400 text-sm py-8 text-center italic bg-slate-50 rounded-2xl border border-slate-100">Belum ada data ujian.</p>
                ) : (
                  <div className="space-y-4 text-sm">
                    {riwayatUkl.map(u => (
                      <div key={u.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-slate-900 capitalize">
                          <span>{u.namaAsli} <span className="text-xs text-slate-500 font-normal">({u.namaHalaqoh})</span></span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-bold">{u.hasilUjian}</span>
                            {currentUser.role === 'admin' && (
                              <button 
                                onClick={() => handleDownloadCertificatePdf(u)}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                🏆 Cetak / Unduh Sertifikat PDF
                              </button>
                            )}
                            {['admin', 'guru'].includes(currentUser.role) && (
                              <button onClick={() => hapusUklItem(u.id)} title="Hapus" className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700"><b>{u.jenisUjian}:</b> {u.materiUjian}</p>
                        <p className="text-xs text-slate-400">Penguji: {u.penguji} | Tanggal: {formatDateDisplay(u.tanggal)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'rapor' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-3.5 py-1 rounded-xl font-bold uppercase tracking-wider border border-blue-200">Modul Akademik Resmi</span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-2">📑 E-Rapor Semester Tahfidz Al-Qur'an</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Pilih murid dan semester untuk menerbitkan rapor hasil belajar lengkap berformat cetak/PDF.</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Pilih Murid</label>
                    <select 
                      value={selectedRaporMurid} 
                      onChange={(e) => setSelectedRaporMurid(e.target.value)} 
                      className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs"
                    >
                      <option value="">-- Pilih Nama Murid --</option>
                      {semuaSiswaList.map((s, idx) => (
                        <option key={idx} value={s.nama}>{s.nama} ({s.halaqoh} - {s.kelas})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Pilih Semester Akademik</label>
                    <select 
                      value={selectedSemester} 
                      onChange={(e) => setSelectedSemester(e.target.value)} 
                      className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-blue-700 shadow-2xs"
                    >
                      <option value="Semester Ganjil (2026/2027)">Semester Ganjil (2026/2027)</option>
                      <option value="Semester Genap (2026/2027)">Semester Genap (2026/2027)</option>
                    </select>
                  </div>
                </div>

                {selectedRaporMurid ? (
                  <div className="pt-4 space-y-5 border-t border-slate-100">
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 text-base capitalize">Murid: {selectedRaporMurid}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl font-bold">{selectedSemester}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Data ringkas: NISN: <b>{storedStudentDetails[selectedRaporMurid]?.nisn || '-'}</b> | Kelas: <b>{storedStudentDetails[selectedRaporMurid]?.kelas || '-'}</b> | Target: <b>{storedStudentDetails[selectedRaporMurid]?.target || '-'}</b>
                      </p>
                      
                      <div className="pt-2">
                        <button 
                          onClick={() => handleDownloadRaporPdf(selectedRaporMurid)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                          🖨️ Cetak / Unduh Rapor Semester (PDF / Print)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-sm italic">
                    Silakan pilih nama murid di atas untuk melihat preview dan mencetak rapor semester.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'halaqoh' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Data & Struktur Halaqoh</h2>
                  <p className="text-blue-100/90 text-sm mt-1">Informasi kelompok halaqoh, pengampu, serta seluruh peserta didik.</p>
                </div>
                <div className="bg-blue-800/90 border border-blue-600/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-blue-100 shrink-0 shadow-inner flex items-center gap-2">
                  <span>📅 {todayFormatted}</span>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <input 
                  type="text" 
                  placeholder="🔍 Cari nama murid dalam halaqoh..." 
                  value={searchHalaqohMurid} 
                  onChange={(e) => setSearchHalaqohMurid(e.target.value)} 
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium shadow-2xs" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(manageHalaqohData).map(([namaHalaqoh, listMurid], idx) => {
                  const filteredListMurid = listMurid.filter(m => m.toLowerCase().includes(searchHalaqohMurid.toLowerCase()));
                  
                  return (
                    <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{namaHalaqoh}</h3>
                          <div className="text-xs text-slate-500 mt-1">
                            Pengampu: <span className="font-extrabold text-blue-700">{manageGuruPengampu[namaHalaqoh] || '-'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                            {listMurid.length} Murid
                          </span>
                        </div>
                      </div>
                      
                      <ul className="text-sm text-slate-700 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {filteredListMurid.length === 0 ? (
                          <li className="py-4 text-center text-slate-400 italic text-xs">Tidak ada murid yang cocok dengan pencarian.</li>
                        ) : (
                          filteredListMurid.map((m, i) => {
                            const originalIdx = listMurid.indexOf(m);
                            return (
                              <li key={i} className="py-3 px-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-200/70 gap-2 shadow-2xs">
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 truncate block">{originalIdx + 1}. {m}</span>
                                  <p className="text-xs text-slate-400 font-mono mt-0.5">NISN: {storedStudentDetails[m]?.nisn || '-'}</p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-bold whitespace-nowrap">{storedStudentDetails[m]?.kelas || '-'}</span>
                                  {currentUser.role === 'admin' && (
                                    <button 
                                      onClick={() => handleDeleteMurid(namaHalaqoh, m)} 
                                      title="Hapus Murid" 
                                      className="text-rose-600 hover:text-rose-800 text-xs bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 font-bold shadow-2xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeMenu === 'murid' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">📚 Data Induk Murid & Target Hafalan</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Total terdata: {semuaSiswaList.length} murid lengkap NISN, Kelas, dan Target.</p>
                </div>
                <div className="w-full sm:w-80">
                  <input type="text" placeholder="Cari nama, NISN, atau kelas..." value={searchMurid} onChange={(e) => setSearchMurid(e.target.value)} className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium shadow-2xs" />
                </div>
              </div>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 whitespace-nowrap">
                      <th className="p-4 rounded-l-xl">No</th>
                      <th className="p-4">Nama Lengkap Murid</th>
                      <th className="p-4">NISN</th>
                      <th className="p-4">Kelas</th>
                      <th className="p-4">Target Kelulusan</th>
                      <th className="p-4">Halaqoh</th>
                      <th className="p-4 rounded-r-xl">Pengampu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswaList.map((siswa, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-4 align-middle text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-4 align-middle font-bold text-slate-900 capitalize whitespace-nowrap">{siswa.nama}</td>
                        <td className="p-4 align-middle text-slate-600 font-mono text-xs whitespace-nowrap">{siswa.nisn}</td>
                        <td className="p-4 align-middle font-bold text-emerald-700 whitespace-nowrap">{siswa.kelas}</td>
                        <td className="p-4 align-middle font-bold text-blue-600 whitespace-nowrap">{siswa.target}</td>
                        <td className="p-4 align-middle text-slate-700 whitespace-nowrap">{siswa.halaqoh}</td>
                        <td className="p-4 align-middle text-slate-700 whitespace-nowrap">{siswa.pengampu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'ortu' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Portal Wali Murid / Orang Tua</h2>
                  <p className="text-blue-100/90 text-sm mt-1">Cari nama anak untuk melihat rekapitulasi capaian hafalan, skor adab, dan peringkat secara transparan.</p>
                </div>
                <div className="bg-blue-800/90 border border-blue-600/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-blue-100 shrink-0 shadow-inner flex items-center gap-2">
                  <span>📅 {todayFormatted}</span>
                </div>
              </div>

              {/* Sub-Tab Khusus di Portal Wali Murid */}
              <div className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
                <button 
                  onClick={() => setActiveOrtuSubTab('pencarian')} 
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${activeOrtuSubTab === 'pencarian' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🔍 Pencarian Anak & Peringkat Harian
                </button>
                <button 
                  onClick={() => setActiveOrtuSubTab('rekap_lengkap')} 
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${activeOrtuSubTab === 'rekap_lengkap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  📈 Rekap Lengkap & Perkembangan Anak
                </button>
              </div>

              {activeOrtuSubTab === 'pencarian' ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>🔍</span> Cari Perkembangan & Capaian Hafalan Anak (Auto Suggest)
                    </h3>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Ketik huruf pertama nama anak (Contoh: I... atau Isa)..." 
                        value={searchOrangTua}
                        onChange={(e) => {
                          setSearchOrangTua(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                      
                      {/* Autocomplete suggestions dropdown */}
                      {showSuggestions && searchOrangTua.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto">
                          {semuaSiswaList
                            .filter(s => s.nama.toLowerCase().includes(searchOrangTua.toLowerCase()))
                            .map((s, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  setSearchOrangTua(s.nama);
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-800 border-b border-slate-100 flex justify-between items-center"
                              >
                                <span className="font-bold">{s.nama}</span>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{s.halaqoh}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {searchOrangTua.trim() && (
                      <div className="pt-4 space-y-4">
                        {selectedMuridData ? (
                          <div className="space-y-5">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 space-y-4 shadow-2xs">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-200/70 pb-4">
                                <div>
                                  <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-xl font-bold uppercase tracking-wider">Hasil Pencarian Murid</span>
                                  <h4 className="text-xl font-extrabold text-slate-900 mt-1 capitalize">{selectedMuridData.namaAsli}</h4>
                                  <p className="text-xs text-slate-600 font-medium mt-0.5">Kelompok: <b className="text-blue-700">{selectedMuridData.halaqohAnak}</b> • Pengampu: <b className="text-slate-800">{manageGuruPengampu[selectedMuridData.halaqohAnak] || '-'}</b></p>
                                </div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">Peringkat: <b className="text-blue-600">#{peringkatMurid}</b></span>
                                  <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs">Total Poin: {selectedMuridData.totalPoin}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                  <span className="text-slate-500 font-bold block">Total Kehadiran Sesi</span>
                                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{selectedMuridData.totalHadir} Sesi</span>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                  <span className="text-slate-500 font-bold block">Setoran Surat / Materi</span>
                                  <span className="text-base font-extrabold text-blue-600 mt-0.5 block">{selectedMuridData.totalSetoranSurat} Kali</span>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                  <span className="text-slate-500 font-bold block">Rata-rata Skor Adab</span>
                                  <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                                    {selectedMuridData.dataMurid.length > 0 ? (selectedMuridData.dataMurid.reduce((a, c) => a + c.skorAdab, 0) / selectedMuridData.dataMurid.length).toFixed(1) : '0'} / 10
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">📜 Riwayat Capaian Mutabaah Terbaru:</h5>
                                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                  {selectedMuridData.dataMurid.map((item) => (
                                    <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200/80 text-sm space-y-1.5 shadow-2xs">
                                      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                                        <span>📅 {formatDateDisplay(item.tanggal)} ({item.hari})</span>
                                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">{item.hadir}</span>
                                      </div>
                                      <p className="text-slate-800 font-medium">
                                        <b className="text-blue-700">{item.jenisSetoran}</b>: {item.rincianCapaian}
                                      </p>
                                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                                        <span className="text-slate-600 font-bold">Predikat: <b className="text-blue-600">{item.predikat}</b></span>
                                        <span className="text-slate-600 font-bold">Skor Adab: <b className="text-slate-900">{item.skorAdab}/10</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm italic">
                            Nama anak "{searchOrangTua}" tidak ditemukan dalam catatan mutabaah atau periksa kembali ejaan namanya.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>🏆</span> Top 15 Peringkat Harian Terbaik (Auto Reset Setiap Hari)
                      </h3>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl font-bold">Tanggal: {todayFormatted}</span>
                    </div>
                    {leaderboardPortalToday.length === 0 ? (
                      <p className="text-slate-400 text-sm py-8 text-center italic">Belum ada aktivitas mutabaah yang tercatat pada hari ini. Data akan tereset otomatis setiap hari.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {leaderboardPortalToday.slice(0, 15).map((m, idx) => (
                          <div key={m.namaKey} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/70 text-sm gap-3 shadow-2xs">
                            <div className="flex items-center gap-3.5">
                              <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs shrink-0 shadow-2xs ${idx === 0 ? 'bg-amber-400 text-amber-950 font-black' : idx === 1 ? 'bg-slate-300 text-slate-800 font-bold' : idx === 2 ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}>
                                {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchOrangTua(m.namaAsli);
                                    setShowSuggestions(false);
                                  }}
                                  className="font-bold text-slate-900 capitalize block hover:text-blue-700 hover:underline text-left"
                                  title="Lihat detail capaian murid"
                                >
                                  {m.namaAsli}
                                </button>
                                <span className="text-xs text-slate-500 font-medium">{m.halaqohAnak}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium self-end sm:self-auto">
                              <span className="text-slate-600">Hadir: <b className="text-slate-900">{m.totalHadir} sesi</b></span>
                              <span className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-xs">Poin Harian: {m.totalPoin}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">📈 Tab Khusus: Rekap Lengkap & Perkembangan Anak</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Analisis komprehensif perkembangan hafalan, nilai adab, dan grafik pencapaian seluruh murid secara mendalam.</p>
                  </div>

                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setPortalPeriodeFilter('hari')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${portalPeriodeFilter === 'hari' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Hari</button>
                      <button onClick={() => setPortalPeriodeFilter('tanggal')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${portalPeriodeFilter === 'tanggal' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Tanggal</button>
                      <button onClick={() => setPortalPeriodeFilter('pekan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${portalPeriodeFilter === 'pekan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Pekan</button>
                      <button onClick={() => setPortalPeriodeFilter('bulan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${portalPeriodeFilter === 'bulan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Bulan</button>
                    </div>

                    {portalPeriodeFilter === 'hari' && (
                      <select value={portalFilterHari} onChange={(e) => setPortalFilterHari(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs">
                        <option value="">Semua Hari</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    )}

                    {portalPeriodeFilter === 'tanggal' && (
                      <input type="date" value={portalFilterTanggal} onChange={(e) => setPortalFilterTanggal(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs" />
                    )}

                    {portalPeriodeFilter === 'pekan' && (
                      <select value={portalFilterPekan} onChange={(e) => setPortalFilterPekan(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs">
                        <option value="">Semua Pekan</option>
                        <option value="Pekan 1">Pekan 1</option>
                        <option value="Pekan 2">Pekan 2</option>
                        <option value="Pekan 3">Pekan 3</option>
                        <option value="Pekan 4">Pekan 4</option>
                      </select>
                    )}

                    {portalPeriodeFilter === 'bulan' && (
                      <input type="month" value={portalFilterBulan} onChange={(e) => setPortalFilterBulan(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 shadow-2xs">
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Total Murid Aktif</span>
                      <span className="text-3xl font-extrabold text-blue-900">{semuaSiswaList.length} Murid</span>
                      <p className="text-xs text-slate-600">Terdaftar dalam {totalHalaqohSemua} kelompok halaqoh.</p>
                    </div>
                    <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 shadow-2xs">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Total Sesi Pembelajaran</span>
                      <span className="text-3xl font-extrabold text-emerald-900">{totalSesiTargetPortal} Sesi</span>
                      <p className="text-xs text-slate-600">Target sesi sesuai periode tahfidz: harian 1, pekanan 4, bulanan 16.</p>
                      <p className="text-xs font-bold text-emerald-800">Indikator: Realisasi {totalSesiAktualPortal}/{totalSesiTargetPortal} sesi ({persentaseSesiPortal}%)</p>
                    </div>
                    <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 shadow-2xs">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Rata-rata Skor Keseluruhan</span>
                      <span className="text-3xl font-extrabold text-amber-900">
                        {filteredPortalRiwayat.length > 0 ? (filteredPortalRiwayat.reduce((a, c) => a + c.skorAdab, 0) / filteredPortalRiwayat.length).toFixed(1) : '0'} <span className="text-sm font-normal">/ 10</span>
                      </span>
                      <p className="text-xs text-slate-600">Predikat adab dan kedisiplinan murid.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">📋 Daftar Rekapitulasi Perkembangan Seluruh Murid</h4>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {portalRecapByStudent.map(({ siswa, totalSesiAnak, totalPoinAnak, totalSetoranAnak, avgAdab }, idx) => {

                        return (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm shadow-2xs">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-900 capitalize block text-base">{idx + 1}. {siswa.nama}</span>
                              <p className="text-xs text-slate-500 font-medium">{siswa.halaqoh} • Kelas: {siswa.kelas} • NISN: {siswa.nisn}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs self-end sm:self-auto font-medium flex-wrap">
                              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">Sesi: <b className="text-slate-900">{totalSesiAnak}</b></span>
                              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">Setoran: <b className="text-blue-700">{totalSetoranAnak}</b></span>
                              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">Rata Adab: <b className="text-emerald-700">{avgAdab}/10</b></span>
                              <span className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-xs">Total Poin: {totalPoinAnak}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'absensi-guru' && (
            <div className="space-y-6">
              {['admin', 'guru'].includes(currentUser.role) && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3.5">📋 Pencatatan Absensi Pengampu</h2>
                  <form onSubmit={handleAbsensiGuruSubmit} className="space-y-4 text-sm">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Halaqoh</label>
                      {currentUser.role === 'guru' ? (
                        <input 
                          type="text" 
                          value={absensiGuruData.namaHalaqoh} 
                          readOnly 
                          className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-slate-800 text-sm shadow-2xs" 
                        />
                      ) : (
                        <select 
                          name="namaHalaqoh" 
                          value={absensiGuruData.namaHalaqoh} 
                          onChange={handleAbsensiGuruChange} 
                          className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs"
                        >
                          {Object.keys(manageHalaqohData).map((h, idx) => <option key={idx} value={h}>{h}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Pengampu</label>
                        <input type="text" name="ustadz" value={absensiGuruData.ustadz} readOnly className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tanggal (Auto)</label>
                        <input type="date" name="tanggal" value={absensiGuruData.tanggal || initialAbsensiDate} onChange={handleAbsensiGuruChange} className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hari Tahfidz</label>
                        <select name="hari" value={absensiGuruData.hari} onChange={handleAbsensiGuruChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-blue-600 shadow-2xs">
                          <option value="Senin">Senin</option>
                          <option value="Selasa">Selasa</option>
                          <option value="Rabu">Rabu</option>
                          <option value="Kamis">Kamis</option>
                          <option value="Jumat">Jumat</option>
                          <option value="Sabtu">Sabtu</option>
                          <option value="Minggu">Minggu</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Status Kehadiran</label>
                        <select name="kehadiran" value={absensiGuruData.kehadiran} onChange={handleAbsensiGuruChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-extrabold text-emerald-700 shadow-2xs">
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pekan</label>
                        <select name="pekan" value={absensiGuruData.pekan} onChange={handleAbsensiGuruChange} className="w-full p-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-bold text-blue-600 shadow-2xs">
                          {daftarPekan.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
                      <input type="text" name="keterangan" placeholder="Keterangan tambahan..." value={absensiGuruData.keterangan} onChange={handleAbsensiGuruChange} className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md text-base">Simpan Absensi</button>
                  </form>
                </div>
              )}

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3.5">
                  <h2 className="text-base font-bold text-slate-900">📜 Riwayat Absensi Pengampu</h2>
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={handleExportAbsensiExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5"
                    >
                      📊 Ekspor ke Excel (.xls)
                    </button>
                  )}
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAbsensiPeriodeFilter('semua')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${absensiPeriodeFilter === 'semua' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Semua</button>
                    <button onClick={() => setAbsensiPeriodeFilter('hari')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${absensiPeriodeFilter === 'hari' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Hari</button>
                    <button onClick={() => setAbsensiPeriodeFilter('tanggal')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${absensiPeriodeFilter === 'tanggal' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Tanggal</button>
                    <button onClick={() => setAbsensiPeriodeFilter('pekan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${absensiPeriodeFilter === 'pekan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Pekan</button>
                    <button onClick={() => setAbsensiPeriodeFilter('bulan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${absensiPeriodeFilter === 'bulan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>Bulan</button>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-xs font-semibold text-slate-700">Halaqoh:</span>
                    <select value={absensiHalaqohFilter} onChange={(e) => setAbsensiHalaqohFilter(e.target.value)} className="p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs shadow-2xs">
                      <option value="Semua">Semua Halaqoh</option>
                      {Object.keys(manageHalaqohData).map((hName) => (
                        <option key={hName} value={hName}>{hName}</option>
                      ))}
                    </select>
                  </div>

                  {absensiPeriodeFilter === 'hari' && (
                    <select value={absensiFilterHari} onChange={(e) => setAbsensiFilterHari(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs">
                      <option value="">Semua Hari</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                      <option value="Minggu">Minggu</option>
                    </select>
                  )}

                  {absensiPeriodeFilter === 'tanggal' && (
                    <input type="date" value={absensiFilterTanggal} onChange={(e) => setAbsensiFilterTanggal(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs" />
                  )}

                  {absensiPeriodeFilter === 'pekan' && (
                    <select value={absensiFilterPekan} onChange={(e) => setAbsensiFilterPekan(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs">
                      <option value="">Semua Pekan</option>
                      <option value="Pekan 1">Pekan 1</option>
                      <option value="Pekan 2">Pekan 2</option>
                      <option value="Pekan 3">Pekan 3</option>
                      <option value="Pekan 4">Pekan 4</option>
                    </select>
                  )}

                  {absensiPeriodeFilter === 'bulan' && (
                    <input type="month" value={absensiFilterBulan} onChange={(e) => setAbsensiFilterBulan(e.target.value)} className="p-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm shadow-2xs" />
                  )}
                </div>

                {filteredAbsensiRiwayat.length === 0 ? (
                  <p className="text-slate-400 text-sm py-10 text-center italic bg-slate-50 rounded-2xl border border-slate-100">Belum ada data absensi pengampu.</p>
                ) : (
                  <div className="space-y-3.5 text-sm">
                    {filteredAbsensiRiwayat.map(item => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-slate-900">
                          <span>{item.ustadz} <span className="text-xs text-slate-500 font-normal">({item.namaHalaqoh})</span></span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-bold">{item.kehadiran}</span>
                            {['admin', 'guru'].includes(currentUser.role) && (
                              <button onClick={() => hapusAbsensiGuruItem(item.id)} title="Hapus" className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700"><b>{item.hari} • {item.pekan}</b></p>
                        {item.keterangan && <p className="text-slate-500 italic">"{item.keterangan}"</p>}
                        <p className="text-xs text-slate-400">Tanggal: {formatDateDisplay(item.tanggal)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'pengaturan' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="bg-blue-50 text-blue-700 text-xs px-3.5 py-1 rounded-xl font-bold uppercase tracking-wider border border-blue-200">Panel Pengaturan Sistem</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-2">⚙️ Pengaturan & Konfigurasi Sistem</h2>
                <p className="text-sm text-slate-500 mt-0.5">Kelola identitas madrasah, manajemen akun pengampu, backup data, dan target hafalan.</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { key: 'profil', label: 'Profil Madrasah' },
                    { key: 'akun', label: 'Akun Pengampu' },
                    { key: 'backup', label: 'Backup & Restore' },
                    { key: 'target', label: 'Target Hafalan' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSettingTab(tab.key)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                        activeSettingTab === tab.key 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[280px]">
                {activeSettingTab === 'profil' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert('Profil & Identitas Madrasah berhasil diperbarui!');
                  }} className="space-y-4 text-sm max-w-2xl">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Nama Resmi Madrasah / Sekolah</label>
                      <input 
                        type="text" 
                        value={schoolProfile.nama} 
                        onChange={(e) => setSchoolProfile({ ...schoolProfile, nama: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 shadow-2xs" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Alamat Lengkap</label>
                      <input 
                        type="text" 
                        value={schoolProfile.alamat} 
                        onChange={(e) => setSchoolProfile({ ...schoolProfile, alamat: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 shadow-2xs" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Tahun Ajaran Aktif</label>
                        <input 
                          type="text" 
                          value={schoolProfile.tahunAjaran} 
                          onChange={(e) => setSchoolProfile({ ...schoolProfile, tahunAjaran: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-blue-700 shadow-2xs" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Nomor Telepon / Kontak</label>
                        <input 
                          type="text" 
                          value={schoolProfile.telepon} 
                          onChange={(e) => setSchoolProfile({ ...schoolProfile, telepon: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 shadow-2xs" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Email Resmi</label>
                      <input 
                        type="email" 
                        value={schoolProfile.email} 
                        onChange={(e) => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 shadow-2xs" 
                      />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md">Simpan Perubahan Profil</button>
                  </form>
                )}

                {activeSettingTab === 'akun' && (
                  <div className="space-y-4 text-sm max-w-2xl">
                    <p className="text-slate-600">Daftar username login default untuk pengampu halaqoh:</p>
                    <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <li><b>Ustadz Mulia</b>: Username: <code>ustadz_mulia</code> | Password: <code>guru123</code></li>
                      <li><b>Ustadz Lutfan</b>: Username: <code>ustadz_lutfan</code> | Password: <code>guru123</code></li>
                      <li><b>Ustadz Eechram</b>: Username: <code>ustadz_eechram</code> | Password: <code>guru123</code></li>
                      <li><b>Ustadzah Amel</b>: Username: <code>ustadzah_amel</code> | Password: <code>guru123</code></li>
                      <li><b>Ustadzah Suci</b>: Username: <code>ustadzah_suci</code> | Password: <code>guru123</code></li>
                    </ul>
                  </div>
                )}

                {activeSettingTab === 'backup' && (
                  <div className="space-y-4 text-sm max-w-2xl">
                    <p className="text-slate-600">Anda dapat mengunduh seluruh data aplikasi (LocalStorage) sebagai cadangan JSON atau memulihkannya kembali.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
                          const dlAnchorElem = document.createElement('a');
                          dlAnchorElem.setAttribute("href", dataStr);
                          const backupDate = getTodayDateStr();
                          dlAnchorElem.setAttribute("download", `backup_mutabaah_${backupDate}.json`);
                          dlAnchorElem.click();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition shadow-xs"
                      >
                        📥 Download Backup JSON
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingTab === 'target' && (
                  <div className="space-y-4 text-sm max-w-2xl">
                    <p className="text-slate-600">Pengaturan standar target kelulusan hafalan santri di {schoolProfile.nama}:</p>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl font-bold text-blue-900">
                      Target Utama: 3 Juz (Juz 30, 29, dan 28) selama masa pendidikan menengah tingkat pertama.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        <nav className="lg:hidden bg-white border-t border-slate-200/80 px-2 py-2 fixed bottom-0 left-0 right-0 z-40 shadow-xl">
          <div className="flex gap-2 overflow-x-auto px-1 py-1 scroll-smooth snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
            {dynamicNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleMenuChange(item.key)}
                className={`flex-shrink-0 snap-center flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-2xl transition duration-200 ease-out active:scale-95 ${activeMenu === item.key ? 'bg-blue-50/90 text-blue-600 shadow-md' : 'bg-slate-50/90 text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-2xl transition ${activeMenu === item.key ? 'bg-blue-100 shadow' : 'bg-slate-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <span className="text-[11px] mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
    );
}

