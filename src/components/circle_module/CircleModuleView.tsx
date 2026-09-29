import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  CheckSquare,
  Square,
  FileText,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Printer,
  Calculator,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Briefcase,
  FileCheck,
  Download,
  DollarSign,
  TrendingUp,
  Tag,
  RefreshCw,
  Check,
  CheckCheck,
  LayoutGrid,
  List,
  Send,
  FolderGit2,
  Settings,
  Sliders,
  Eye,
  BookOpen,
  Layers,
  ArrowRightLeft,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import {
  CompanyCircleProfile,
  CircleTaskItem,
  HearingNotice,
  ShowCauseAndOrderRecord,
  CircleReminder,
  OfficerRecord,
  CircleAssignmentConfig,
  FileMovementRecord
} from '../../types/circle';
import {
  loadCircleProfiles,
  saveCircleProfiles,
  loadCircleTasks,
  saveCircleTasks,
  loadHearingNotices,
  saveHearingNotices,
  loadShowCauseAndOrders,
  saveShowCauseAndOrders,
  loadCircleReminders,
  saveCircleReminders,
  loadCircleAssignments,
  saveCircleAssignments,
  loadOfficers,
  saveOfficers,
  loadCircleFileMovements,
  saveCircleFileMovements,
  syncCircleOfficersToCompanies,
  applyOfficerAssignmentToCompanies,
  bulkAssignOfficersToCompanies
} from '../../utils/circleStorage';
import { formatCurrencyCrore, formatBanglaNumber, takaToCrore } from '../../utils/converter';
import { CompanyProfileModal } from './CompanyProfileModal';
import { HearingNoticeModal } from './HearingNoticeModal';
import { ShowCauseModal } from './ShowCauseModal';
import { CircleTaskModal } from './CircleTaskModal';
import { CircleReminderModal } from './CircleReminderModal';
import { OfficerAssignmentModal } from './OfficerAssignmentModal';
import { AssignOfficerModal } from './AssignOfficerModal';
import { BulkCompanyAssignModal } from './BulkCompanyAssignModal';
import { OfficerEditModal } from './OfficerEditModal';
import { CircleSettingsModal } from './CircleSettingsModal';
import { FileMovementModal } from './FileMovementModal';

interface CircleModuleViewProps {
  onBackToCases?: () => void;
}

export const CircleModuleView: React.FC<CircleModuleViewProps> = ({ onBackToCases }) => {
  // State from storage
  const [companies, setCompanies] = useState<CompanyCircleProfile[]>(() => loadCircleProfiles());
  const [tasks, setTasks] = useState<CircleTaskItem[]>(() => loadCircleTasks());
  const [notices, setNotices] = useState<HearingNotice[]>(() => loadHearingNotices());
  const [scnOrders, setScnOrders] = useState<ShowCauseAndOrderRecord[]>(() => loadShowCauseAndOrders());
  const [reminders, setReminders] = useState<CircleReminder[]>(() => loadCircleReminders());
  const [assignments, setAssignments] = useState<CircleAssignmentConfig[]>(() => loadCircleAssignments());
  const [officers, setOfficers] = useState<OfficerRecord[]>(() => loadOfficers());
  const [fileMovements, setFileMovements] = useState<FileMovementRecord[]>(() => loadCircleFileMovements());

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'companies' | 'file_movement' | 'directory' | 'checklist' | 'hearing' | 'scn' | 'reminders' | 'assignments'>('companies');

  // Company View Mode (Grid View vs List View)
  const [companyViewMode, setCompanyViewMode] = useState<'list' | 'grid'>('list');

  // Circle Filter
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File Movement filters
  const [fileMovementStatusFilter, setFileMovementStatusFilter] = useState<string>('all');
  const [fileMovementUrgencyFilter, setFileMovementUrgencyFilter] = useState<string>('all');

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyCircleProfile | null>(null);

  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<HearingNotice | null>(null);
  const [prefilledHearingCompany, setPrefilledHearingCompany] = useState<CompanyCircleProfile | undefined>(undefined);

  const [isScnModalOpen, setIsScnModalOpen] = useState(false);
  const [editingScn, setEditingScn] = useState<ShowCauseAndOrderRecord | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CircleTaskItem | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<CircleReminder | null>(null);

  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [officerModalCircle, setOfficerModalCircle] = useState<string>('১');

  // Circle Management/Settings Modal
  const [isCircleSettingsOpen, setIsCircleSettingsOpen] = useState(false);
  const [circleSettingsInitialCircle, setCircleSettingsInitialCircle] = useState<string>('১');

  // File Movement Modal
  const [isFileMovementModalOpen, setIsFileMovementModalOpen] = useState(false);
  const [editingFileMovement, setEditingFileMovement] = useState<FileMovementRecord | null>(null);

  // Officer Edit / Information Update Modal
  const [isOfficerEditModalOpen, setIsOfficerEditModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<OfficerRecord | null>(null);

  // Bulk Selection States
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [officerDesignationFilter, setOfficerDesignationFilter] = useState<string>('all');
  const [officerSearchQuery, setOfficerSearchQuery] = useState<string>('');

  // Modals for Officer Assignment & Bulk Company Assign
  const [isAssignOfficerModalOpen, setIsAssignOfficerModalOpen] = useState(false);
  const [officersToAssign, setOfficersToAssign] = useState<OfficerRecord[]>([]);
  const [isBulkCompanyAssignModalOpen, setIsBulkCompanyAssignModalOpen] = useState(false);

  // Bulk Selection Helpers
  const toggleSelectCompany = (id: string) => {
    setSelectedCompanyIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCompanies = () => {
    if (selectedCompanyIds.length === filteredCompanies.length && filteredCompanies.length > 0) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(filteredCompanies.map(c => c.id));
    }
  };

  const toggleSelectOfficer = (id: string) => {
    setSelectedOfficerIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOfficers = () => {
    if (selectedOfficerIds.length === filteredOfficers.length && filteredOfficers.length > 0) {
      setSelectedOfficerIds([]);
    } else {
      setSelectedOfficerIds(filteredOfficers.map(o => o.id));
    }
  };

  const handleOpenBulkAssignOfficerModal = () => {
    const selected = officers.filter(o => selectedOfficerIds.includes(o.id));
    if (selected.length === 0) return;
    setOfficersToAssign(selected);
    setIsAssignOfficerModalOpen(true);
  };

  const handleOpenSingleAssignOfficerModal = (officer: OfficerRecord) => {
    setOfficersToAssign([officer]);
    setIsAssignOfficerModalOpen(true);
  };


  // Persistence helpers
  const handleSaveCompany = (company: CompanyCircleProfile) => {
    let updated: CompanyCircleProfile[];
    if (companies.some(c => c.id === company.id)) {
      updated = companies.map(c => (c.id === company.id ? company : c));
    } else {
      updated = [company, ...companies];
    }
    setCompanies(updated);
    saveCircleProfiles(updated);
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই প্রতিষ্ঠানের প্রোফাইল মুছে ফেলতে চান?')) {
      const updated = companies.filter(c => c.id !== id);
      setCompanies(updated);
      saveCircleProfiles(updated);
    }
  };

  const handleSaveTask = (task: CircleTaskItem) => {
    let updated: CircleTaskItem[];
    if (tasks.some(t => t.id === task.id)) {
      updated = tasks.map(t => (t.id === task.id ? task : t));
    } else {
      updated = [task, ...tasks];
    }
    setTasks(updated);
    saveCircleTasks(updated);
  };

  const handleToggleTaskStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus: CircleTaskItem['status'] = t.status === 'completed' ? 'pending' : 'completed';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    setTasks(updated);
    saveCircleTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveCircleTasks(updated);
  };

  const handleSaveNotice = (notice: HearingNotice) => {
    let updated: HearingNotice[];
    if (notices.some(n => n.id === notice.id)) {
      updated = notices.map(n => (n.id === notice.id ? notice : n));
    } else {
      updated = [notice, ...notices];
    }
    setNotices(updated);
    saveHearingNotices(updated);
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই শুনানীর চিঠি মুছে ফেলতে চান?')) {
      const updated = notices.filter(n => n.id !== id);
      setNotices(updated);
      saveHearingNotices(updated);
    }
  };

  const handleSaveScn = (record: ShowCauseAndOrderRecord) => {
    let updated: ShowCauseAndOrderRecord[];
    if (scnOrders.some(s => s.id === record.id)) {
      updated = scnOrders.map(s => (s.id === record.id ? record : s));
    } else {
      updated = [record, ...scnOrders];
    }
    setScnOrders(updated);
    saveShowCauseAndOrders(updated);
  };

  const handleDeleteScn = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই কারণ দর্শাও ও বিচারাদেশের তথ্য মুছে ফেলতে চান?')) {
      const updated = scnOrders.filter(s => s.id !== id);
      setScnOrders(updated);
      saveShowCauseAndOrders(updated);
    }
  };

  const handleSaveReminder = (reminder: CircleReminder) => {
    let updated: CircleReminder[];
    if (reminders.some(r => r.id === reminder.id)) {
      updated = reminders.map(r => (r.id === reminder.id ? reminder : r));
    } else {
      updated = [reminder, ...reminders];
    }
    setReminders(updated);
    saveCircleReminders(updated);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    saveCircleReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveCircleReminders(updated);
  };

  const handleSaveAssignment = (config: CircleAssignmentConfig, syncToCompanies: boolean) => {
    let updatedConfigs: CircleAssignmentConfig[];
    if (assignments.some(a => a.circle === config.circle)) {
      updatedConfigs = assignments.map(a => (a.circle === config.circle ? config : a));
    } else {
      updatedConfigs = [...assignments, config];
    }
    setAssignments(updatedConfigs);
    saveCircleAssignments(updatedConfigs);

    if (syncToCompanies) {
      const updatedComps = syncCircleOfficersToCompanies(config.circle, config, companies);
      setCompanies(updatedComps);
      saveCircleProfiles(updatedComps);
    }
  };

  const handleSaveOfficer = (officer: OfficerRecord) => {
    let updated: OfficerRecord[];
    if (officers.some(o => o.id === officer.id)) {
      updated = officers.map(o => (o.id === officer.id ? officer : o));
    } else {
      updated = [...officers, officer];
    }
    setOfficers(updated);
    saveOfficers(updated);
  };

  // File Movement handlers
  const handleSaveFileMovement = (record: FileMovementRecord) => {
    let updated: FileMovementRecord[];
    if (fileMovements.some(m => m.id === record.id)) {
      updated = fileMovements.map(m => (m.id === record.id ? record : m));
    } else {
      updated = [record, ...fileMovements];
    }
    setFileMovements(updated);
    saveCircleFileMovements(updated);
  };

  const handleMarkMovementReceived = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = fileMovements.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'গৃহীত' as const,
          receivedDate: today,
          updatedAt: today
        };
      }
      return m;
    });
    setFileMovements(updated);
    saveCircleFileMovements(updated);
  };

  const handleMarkMovementResolved = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = fileMovements.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'নিষ্পন্ন' as const,
          updatedAt: today
        };
      }
      return m;
    });
    setFileMovements(updated);
    saveCircleFileMovements(updated);
  };

  const handleDeleteFileMovement = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই নথি চলাচলের এন্ট্রি মুছে ফেলতে চান?')) {
      const updated = fileMovements.filter(m => m.id !== id);
      setFileMovements(updated);
      saveCircleFileMovements(updated);
    }
  };

  // Circle Settings handler
  const handleSaveCircleConfig = (updatedConfig: CircleAssignmentConfig) => {
    let updated: CircleAssignmentConfig[];
    if (assignments.some(a => a.circle === updatedConfig.circle)) {
      updated = assignments.map(a => (a.circle === updatedConfig.circle ? updatedConfig : a));
    } else {
      updated = [...assignments, updatedConfig];
    }
    setAssignments(updated);
    saveCircleAssignments(updated);
  };

  const handleSyncAssignmentToCompanies = (circle: string) => {
    const config = assignments.find(a => a.circle === circle);
    if (!config) {
      alert(`সার্কেল-${circle} এর কোন কর্মকর্তা অ্যাসাইনমেন্ট কনফিগ পাওয়া যায়নি।`);
      return;
    }
    const compsInCircle = companies.filter(c => c.circle === circle);
    if (compsInCircle.length === 0) {
      alert(`সার্কেল-${circle} এ বর্তমানে কোন প্রতিষ্ঠান নেই।`);
      return;
    }
    if (window.confirm(`আপনি কি সার্কেল-${circle} এর অন্তর্ভুক্ত ${compsInCircle.length} টি প্রতিষ্ঠানের প্রোফাইলে উক্ত কর্মকর্তাদের নাম সিঙ্ক করতে চান?`)) {
      const updatedComps = syncCircleOfficersToCompanies(circle, config, companies);
      setCompanies(updatedComps);
      saveCircleProfiles(updatedComps);
      alert(`সার্কেল-${circle} এর ${compsInCircle.length} টি প্রতিষ্ঠানে সফলভাবে কর্মকর্তা সিঙ্ক করা হয়েছে!`);
    }
  };

  const handleSaveOfficerAssignment = (
    officerIds: string[],
    assignedCircles: string[],
    assignedCompanyIds: string[],
    syncToCompanies: boolean
  ) => {
    const assignedComps = companies.filter(c => assignedCompanyIds.includes(c.id));
    const compNames = assignedComps.map(c => c.companyName);

    const updatedOfficers = officers.map(o => {
      if (officerIds.includes(o.id)) {
        return {
          ...o,
          assignedCircles,
          assignedCompanyIds,
          assignedCompanyNames: compNames
        };
      }
      return o;
    });
    setOfficers(updatedOfficers);
    saveOfficers(updatedOfficers);

    if (syncToCompanies && assignedCompanyIds.length > 0) {
      const targetOfficers = updatedOfficers.filter(o => officerIds.includes(o.id));
      const updatedComps = applyOfficerAssignmentToCompanies(targetOfficers, assignedCompanyIds, companies);
      setCompanies(updatedComps);
      saveCircleProfiles(updatedComps);
    }

    setSelectedOfficerIds([]);
    alert(`সফলভাবে ${officerIds.length} জন কর্মকর্তার সার্কেল/প্রতিষ্ঠান অ্যাসাইনমেন্ট সংরক্ষণ করা হয়েছে!`);
  };

  const handleApplyBulkCompanyAssign = (
    companyIds: string[],
    officersData: {
      officerARO?: string;
      officerRO?: string;
      officerAC_DC?: string;
      officerJC_ADC?: string;
    }
  ) => {
    const updated = bulkAssignOfficersToCompanies(companyIds, officersData, companies);
    setCompanies(updated);
    saveCircleProfiles(updated);
    setSelectedCompanyIds([]);
    alert(`সফলভাবে ${companyIds.length} টি প্রতিষ্ঠানে কর্মকর্তা নিয়োগ হালনাগাদ করা হয়েছে!`);
  };

  const handleSaveOfficerInfo = (updatedOfficer: OfficerRecord, syncToCompanies: boolean) => {
    const exists = officers.some(o => o.id === updatedOfficer.id);
    const oldOfficer = exists ? officers.find(o => o.id === updatedOfficer.id) : null;
    
    let updatedOfficers: OfficerRecord[];
    if (exists) {
      updatedOfficers = officers.map(o => o.id === updatedOfficer.id ? updatedOfficer : o);
    } else {
      updatedOfficers = [updatedOfficer, ...officers];
    }
    setOfficers(updatedOfficers);
    saveOfficers(updatedOfficers);

    // If syncToCompanies is true, update companies & circle assignments if name/designation changed
    if (syncToCompanies && oldOfficer) {
      const oldName = oldOfficer.name;
      const newName = updatedOfficer.name;
      const desig = updatedOfficer.designation;

      const formattedTitle = desig === 'ARO' 
        ? `${newName}, এআরও` 
        : desig === 'RO'
        ? `${newName}, আরও`
        : desig === 'DC'
        ? `${newName}, উপ-কমিশনার`
        : desig === 'AC'
        ? `${newName}, সহকারী কমিশনার`
        : desig === 'ADC'
        ? `${newName}, অতিরিক্ত কমিশনার`
        : `${newName}, যুগ্ম কমিশনার`;

      const updatedCompanies = companies.map(c => {
        let changed = false;
        const comp = { ...c };

        if (comp.officerARO && comp.officerARO.includes(oldName)) {
          comp.officerARO = formattedTitle;
          changed = true;
        }
        if (comp.officerRO && comp.officerRO.includes(oldName)) {
          comp.officerRO = formattedTitle;
          changed = true;
        }
        if (comp.officerAC_DC && comp.officerAC_DC.includes(oldName)) {
          comp.officerAC_DC = formattedTitle;
          changed = true;
        }
        if (comp.officerJC_ADC && comp.officerJC_ADC.includes(oldName)) {
          comp.officerJC_ADC = formattedTitle;
          changed = true;
        }

        if (changed) {
          comp.updatedAt = new Date().toISOString().split('T')[0];
          return comp;
        }
        return c;
      });

      setCompanies(updatedCompanies);
      saveCircleProfiles(updatedCompanies);

      const updatedAssignments = assignments.map(a => {
        let changed = false;
        const cfg = { ...a };
        if (cfg.aroName && cfg.aroName.includes(oldName)) {
          cfg.aroName = formattedTitle;
          changed = true;
        }
        if (cfg.roName && cfg.roName.includes(oldName)) {
          cfg.roName = formattedTitle;
          changed = true;
        }
        if (cfg.acDcName && cfg.acDcName.includes(oldName)) {
          cfg.acDcName = formattedTitle;
          changed = true;
        }
        if (cfg.jcAdcName && cfg.jcAdcName.includes(oldName)) {
          cfg.jcAdcName = formattedTitle;
          changed = true;
        }
        return changed ? cfg : a;
      });

      setAssignments(updatedAssignments);
      saveCircleAssignments(updatedAssignments);
    }
  };

  const handleDeleteOfficer = (id: string) => {
    if (window.confirm('আপনি কি এই কর্মকর্তার তথ্য মুছে ফেলতে চান?')) {
      const updated = officers.filter(o => o.id !== id);
      setOfficers(updated);
      saveOfficers(updated);
    }
  };

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const circleMatch = selectedCircle === 'all' || c.circle === selectedCircle;
      const searchMatch = !searchQuery.trim() ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bondLicenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.commercialManagerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.commercialManagerMobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.officerARO.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.officerRO.toLowerCase().includes(searchQuery.toLowerCase());
      return circleMatch && searchMatch;
    });
  }, [companies, selectedCircle, searchQuery]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const circleMatch = selectedCircle === 'all' || t.circle === selectedCircle;
      const searchMatch = !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.companyName && t.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      return circleMatch && searchMatch;
    });
  }, [tasks, selectedCircle, searchQuery]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const circleMatch = selectedCircle === 'all' || n.circle === selectedCircle;
      const searchMatch = !searchQuery.trim() ||
        n.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.memoNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return circleMatch && searchMatch;
    });
  }, [notices, selectedCircle, searchQuery]);

  // Filtered SCN and Orders
  const filteredScnOrders = useMemo(() => {
    return scnOrders.filter(s => {
      const circleMatch = selectedCircle === 'all' || s.circle === selectedCircle;
      const searchMatch = !searchQuery.trim() ||
        s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.orderNo && s.orderNo.toLowerCase().includes(searchQuery.toLowerCase()));
      return circleMatch && searchMatch;
    });
  }, [scnOrders, selectedCircle, searchQuery]);

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const circleMatch = selectedCircle === 'all' || r.circle === selectedCircle;
      const searchMatch = !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.companyName && r.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      return circleMatch && searchMatch;
    });
  }, [reminders, selectedCircle, searchQuery]);

  // Filtered File Movements
  const filteredFileMovements = useMemo(() => {
    return fileMovements.filter(m => {
      const circleMatch = selectedCircle === 'all' || m.circle === selectedCircle;
      const statusMatch = fileMovementStatusFilter === 'all' || m.status === fileMovementStatusFilter;
      const urgencyMatch = fileMovementUrgencyFilter === 'all' || m.urgency === fileMovementUrgencyFilter;
      const searchMatch = !searchQuery.trim() ||
        m.fileNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.receiverBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.senderOfficer && m.senderOfficer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.receiverOfficer && m.receiverOfficer.toLowerCase().includes(searchQuery.toLowerCase()));
      return circleMatch && statusMatch && urgencyMatch && searchMatch;
    });
  }, [fileMovements, selectedCircle, fileMovementStatusFilter, fileMovementUrgencyFilter, searchQuery]);

  // File Movement KPIs
  const fileMovementKPIs = useMemo(() => {
    const relevant = selectedCircle === 'all' ? fileMovements : fileMovements.filter(m => m.circle === selectedCircle);
    return {
      total: relevant.length,
      transit: relevant.filter(m => m.status === 'চলমান/পথিমধ্যে').length,
      received: relevant.filter(m => m.status === 'গৃহীত').length,
      resolved: relevant.filter(m => m.status === 'নিষ্পন্ন').length,
      returned: relevant.filter(m => m.status === 'ফেরত প্রেরিত').length,
      urgent: relevant.filter(m => m.urgency === 'জরুরি' || m.urgency === 'অতি জরুরি').length
    };
  }, [fileMovements, selectedCircle]);

  // Filtered Officers by designation and search
  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      // Designation filter
      if (officerDesignationFilter !== 'all') {
        if (officerDesignationFilter === 'AC_DC') {
          if (officer.designation !== 'AC' && officer.designation !== 'DC') return false;
        } else if (officerDesignationFilter === 'JC_ADC') {
          if (officer.designation !== 'JC' && officer.designation !== 'ADC') return false;
        } else if (officer.designation !== officerDesignationFilter) {
          return false;
        }
      }
      // Search query
      if (officerSearchQuery.trim()) {
        const q = officerSearchQuery.toLowerCase();
        const matchName = officer.name.toLowerCase().includes(q);
        const matchDesig = officer.designationBangla.toLowerCase().includes(q) || officer.designation.toLowerCase().includes(q);
        const matchMobile = officer.mobile ? officer.mobile.includes(q) : false;
        const matchEmail = officer.email ? officer.email.toLowerCase().includes(q) : false;
        const matchCircle = officer.assignedCircles.some(c => c.includes(q));
        const matchComp = officer.assignedCompanyNames ? officer.assignedCompanyNames.some(n => n.toLowerCase().includes(q)) : false;
        if (!matchName && !matchDesig && !matchMobile && !matchEmail && !matchCircle && !matchComp) {
          return false;
        }
      }
      return true;
    });
  }, [officers, officerDesignationFilter, officerSearchQuery]);

  // Officer designation counts
  const officerCounts = useMemo(() => {
    return {
      all: officers.length,
      ARO: officers.filter(o => o.designation === 'ARO').length,
      RO: officers.filter(o => o.designation === 'RO').length,
      AC_DC: officers.filter(o => o.designation === 'AC' || o.designation === 'DC').length,
      JC_ADC: officers.filter(o => o.designation === 'JC' || o.designation === 'ADC').length
    };
  }, [officers]);


  // Financial and Operational KPIs
  const kpis = useMemo(() => {
    const compInCircle = selectedCircle === 'all' ? companies : companies.filter(c => c.circle === selectedCircle);
    const totalArrearsTaka = compInCircle.reduce((sum, c) => sum + (c.arrearsTaka || 0), 0);
    const totalArrearsCrore = compInCircle.reduce((sum, c) => sum + (c.arrearsCrore || 0), 0);

    const scnInCircle = selectedCircle === 'all' ? scnOrders : scnOrders.filter(s => s.circle === selectedCircle);
    const totalScnDemand = scnInCircle.reduce((sum, s) => sum + (s.demandAmountTaka || 0), 0);
    const totalAdjudicated = scnInCircle.reduce((sum, s) => sum + (s.totalAdjudicatedTaka || 0), 0);
    const totalRealized = scnInCircle.reduce((sum, s) => sum + (s.realizedAmountTaka || 0), 0);
    const totalScnOutstanding = scnInCircle.reduce((sum, s) => sum + (s.outstandingAmountTaka || 0), 0);

    const tasksInCircle = selectedCircle === 'all' ? tasks : tasks.filter(t => t.circle === selectedCircle);
    const pendingTasks = tasksInCircle.filter(t => t.status !== 'completed').length;
    const completedTasks = tasksInCircle.filter(t => t.status === 'completed').length;

    const noticesInCircle = selectedCircle === 'all' ? notices : notices.filter(n => n.circle === selectedCircle);

    return {
      totalCompanies: compInCircle.length,
      totalArrearsTaka,
      totalArrearsCrore,
      totalScnCount: scnInCircle.length,
      totalScnDemand,
      totalAdjudicated,
      totalRealized,
      totalScnOutstanding,
      pendingTasks,
      completedTasks,
      totalNotices: noticesInCircle.length
    };
  }, [companies, scnOrders, tasks, notices, selectedCircle]);

  return (
    <div className="space-y-6 pb-12">
      {/* Module Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium mb-3 backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>সার্কেল ও শাখা অপারেশনাল ওয়ার্কস্পেস</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              সার্কেল/শাখা কার্যপ্রবাহ ও প্রতিষ্ঠান ব্যবস্থাপনা
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              প্রতিষ্ঠানের পরিচিতি, কর্মকর্তা ও কমার্শিয়াল ম্যানেজার ডিরেক্টরি, শুনানীর নোটিশ ও চিঠি প্রস্তুত, চেকলিস্ট ও বিচারাদেশের আর্থিক হিসাব।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setOfficerModalCircle(selectedCircle === 'all' ? '১' : selectedCircle);
                setIsOfficerModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="w-4 h-4" />
              <span>কর্মকর্তা অ্যাসাইনমেন্ট</span>
            </button>

            <button
              onClick={() => {
                setEditingCompany(null);
                setIsCompanyModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রতিষ্ঠান প্রোফাইল</span>
            </button>

            <button
              onClick={() => {
                setEditingNotice(null);
                setPrefilledHearingCompany(undefined);
                setIsHearingModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>শুনানীর চিঠি প্রস্তুত</span>
            </button>

            <button
              onClick={() => {
                setEditingScn(null);
                setIsScnModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calculator className="w-4 h-4" />
              <span>কারণ দর্শাও ও বিচারাদেশ</span>
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>নতুন টাস্ক</span>
            </button>

            <button
              onClick={() => {
                setCircleSettingsInitialCircle(selectedCircle === 'all' ? '১' : selectedCircle);
                setIsCircleSettingsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/90 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>সার্কেল সেটিংস ও লক্ষ্যমাত্রা</span>
            </button>
          </div>
        </div>

        {/* Global Circle Filter Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>সার্কেল নির্বাচন করুন:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'সকল সার্কেল' },
              { id: '১', label: 'সার্কেল - ১' },
              { id: '২', label: 'সার্কেল - ২' },
              { id: '৩', label: 'সার্কেল - ৩' },
              { id: '৪', label: 'সার্কেল - ৪' },
              { id: '৫', label: 'সার্কেল - ৫' },
              { id: '৬', label: 'সার্কেল - ৬' }
            ].map(circle => (
              <button
                key={circle.id}
                onClick={() => setSelectedCircle(circle.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCircle === circle.id
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {circle.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Total Companies */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">তালিকাভুক্ত প্রতিষ্ঠান</span>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatBanglaNumber(kpis.totalCompanies)} টি</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedCircle === 'all' ? 'কমিশনারেটের সার্বিক' : `সার্কেল-${selectedCircle} এর অন্তর্ভুক্ত`}
          </p>
        </div>

        {/* Arrears Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">মোট বকেয়া রাজস্ব</span>
            <div className="p-2 bg-rose-50 rounded-xl">
              <DollarSign className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-700">
            ৳ {formatCurrencyCrore(kpis.totalArrearsCrore)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            ৳ {formatBanglaNumber(kpis.totalArrearsTaka)}
          </p>
        </div>

        {/* SCN Demands */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">কারণ দর্শাও নোটিশ</span>
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-700">{formatBanglaNumber(kpis.totalScnCount)} টি SCN</p>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            দাবি: {formatCurrencyCrore(takaToCrore(kpis.totalScnDemand))}
          </p>
        </div>

        {/* Total Adjudicated */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">বিচারাদেশে ধার্যকৃত</span>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Calculator className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-800">
            {formatCurrencyCrore(takaToCrore(kpis.totalAdjudicated))}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            আদায়: {formatCurrencyCrore(takaToCrore(kpis.totalRealized))}
          </p>
        </div>

        {/* Checklist / Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">চেকলিস্ট ও কাজ</span>
            <div className="p-2 bg-blue-50 rounded-xl">
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-blue-700">
            {formatBanglaNumber(kpis.pendingTasks)} টি বাকি
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            সম্পন্ন: {formatBanglaNumber(kpis.completedTasks)} টি কাজ
          </p>
        </div>

        {/* Hearing Letters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">শুনানীর চিঠি ও নোটিশ</span>
            <div className="p-2 bg-purple-50 rounded-xl">
              <Printer className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-purple-700">{formatBanglaNumber(kpis.totalNotices)} টি প্রস্তুত</p>
          <p className="text-[11px] text-slate-500 mt-1">প্রিন্ট ও জারি উপযুক্ত</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Sub tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'companies'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>প্রতিষ্ঠান ও অডিট ({companies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('file_movement')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'file_movement'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>নথি চলাচল রেজিস্টার ({fileMovements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>কর্মকর্তা ডিরেক্টরি ({officers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>কার্যপ্রবাহ ও চেকলিস্ট ({tasks.filter(t => t.status !== 'completed').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hearing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hearing'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>শুনানীর চিঠি প্রস্তুতকারক ({notices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('scn')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'scn'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>কারণ দর্শাও ও বিচারাদেশ হিসাব ({scnOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reminders'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>রিমাইন্ডার ও সময়সূচি ({reminders.filter(r => !r.completed).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'assignments'
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>সার্কেল অ্যাসাইনমেন্ট</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রতিষ্ঠান, বিন, ম্যানেজার, কর্মকর্তা বা বিষয় খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* SUB-TAB CONTENT */}

        {/* 1. Companies & Officials Directory with Grid / List View & Audit Date */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  প্রতিষ্ঠান পরিচিতি, অডিট স্থিতি ও কর্মকর্তা তালিকা
                </h3>
                <p className="text-xs text-slate-500">
                  সর্বশেষ অডিট তারিখ, অবস্থা, বন্ড লাইসেন্স, বিন, বকেয়া, কমার্শিয়াল ম্যানেজার ও দায়িত্বপ্রাপ্ত কর্মকর্তাদের ডাটাবেজ
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle (Grid View vs List View) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setCompanyViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      companyViewMode === 'list'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="তালিকা ভিউ (List View)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>List View</span>
                  </button>
                  <button
                    onClick={() => setCompanyViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      companyViewMode === 'grid'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="গ্রিড ভিউ (Grid View)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid View</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingCompany(null);
                    setIsCompanyModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রতিষ্ঠান যুক্ত করুন</span>
                </button>
              </div>
            </div>

            {/* Bulk Selection Bar for Companies */}
            {filteredCompanies.length > 0 && (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAllCompanies}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    {selectedCompanyIds.length === filteredCompanies.length && filteredCompanies.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedCompanyIds.length > 0
                        ? `${selectedCompanyIds.length} টি প্রতিষ্ঠান নির্বাচিত`
                        : 'সকল প্রতিষ্ঠান নির্বাচন করুন'}
                    </span>
                  </button>
                  {selectedCompanyIds.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      (মোট {filteredCompanies.length} টির মধ্যে {selectedCompanyIds.length} টি)
                    </span>
                  )}
                </div>
                {selectedCompanyIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsBulkCompanyAssignModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>একযোগে কর্মকর্তা নিয়োগ (Bulk Assign)</span>
                    </button>
                    <button
                      onClick={() => setSelectedCompanyIds([])}
                      className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            )}

            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন প্রতিষ্ঠানের তথ্য পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-0.5">নতুন প্রতিষ্ঠান যোগ করতে ওপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : companyViewMode === 'list' ? (
              /* TABULAR LIST VIEW */
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAllCompanies}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {selectedCompanyIds.length === filteredCompanies.length && filteredCompanies.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 inline" />
                          ) : (
                            <Square className="w-4 h-4 inline" />
                          )}
                        </button>
                      </th>
                      <th className="p-3 min-w-[220px]">প্রতিষ্ঠান নাম ও পরিচিতি</th>
                      <th className="p-3 text-center w-24">সার্কেল</th>
                      <th className="p-3 min-w-[140px]">বিআইএন ও লাইসেন্স</th>
                      <th className="p-3 text-right min-w-[130px]">বকেয়া রাজস্ব</th>
                      <th className="p-3 min-w-[180px]">সর্বশেষ অডিট ও অবস্থা</th>
                      <th className="p-3 min-w-[180px]">দায়িত্বপ্রাপ্ত কর্মকর্তাবৃন্দ</th>
                      <th className="p-3 min-w-[160px]">কমার্শিয়াল ম্যানেজার</th>
                      <th className="p-3 text-center w-28">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompanies.map(company => (
                      <tr
                        key={company.id}
                        className={`hover:bg-indigo-50/30 transition-colors ${
                          selectedCompanyIds.includes(company.id) ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectCompany(company.id)}
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            {selectedCompanyIds.includes(company.id) ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 inline" />
                            ) : (
                              <Square className="w-4 h-4 inline" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                            {company.companyName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{company.address}</p>
                          {company.linkedCaseNos && (
                            <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              মামলা: {company.linkedCaseNos}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 text-[11px]">
                            সার্কেল - {company.circle}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="block text-[11px] font-mono text-slate-700">
                              <strong className="text-slate-400 font-normal">BIN:</strong> {company.bin || '—'}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-mono">
                              <strong className="text-slate-400 font-normal">বন্ড:</strong> {company.bondLicenseNo || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-bold text-rose-600 block text-xs">
                            ৳ {formatCurrencyCrore(company.arrearsCrore)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            ৳ {formatBanglaNumber(company.arrearsTaka || 0)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                company.auditStatus === 'অডিট সম্পন্ন'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : company.auditStatus === 'আপত্তি উত্থাপিত'
                                  ? 'bg-rose-100 text-rose-800'
                                  : company.auditStatus === 'অডিট চলমান'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {company.auditStatus} {company.auditYear ? `(${company.auditYear})` : ''}
                            </span>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span>অডিট: {company.lastAuditDate || 'অনির্ধারিত'}</span>
                            </div>
                            {company.auditOfficer && (
                              <span className="text-[10px] text-slate-500 block truncate max-w-[170px]" title={company.auditOfficer}>
                                কর্মকর্তা: {company.auditOfficer}
                              </span>
                            )}
                            {company.auditObservations && (
                              <p className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 line-clamp-1" title={company.auditObservations}>
                                {company.auditObservations}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-[11px] space-y-0.5">
                            <div className="truncate max-w-[170px]" title={company.officerARO}>
                              <span className="text-slate-400 font-medium">ARO:</span> {company.officerARO || '—'}
                            </div>
                            <div className="truncate max-w-[170px]" title={company.officerRO}>
                              <span className="text-slate-400 font-medium">RO:</span> {company.officerRO || '—'}
                            </div>
                            <div className="truncate max-w-[170px] text-indigo-700 font-medium" title={company.officerAC_DC}>
                              <span className="text-slate-400 font-medium">AC/DC:</span> {company.officerAC_DC || '—'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800 text-[11px]">
                            {company.commercialManagerName || 'নাম নেই'}
                          </p>
                          {company.commercialManagerMobile && (
                            <a
                              href={`tel:${company.commercialManagerMobile}`}
                              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{company.commercialManagerMobile}</span>
                            </a>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setPrefilledHearingCompany(company);
                                setEditingNotice(null);
                                setIsHearingModalOpen(true);
                              }}
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="শুনানির চিঠি প্রস্তুত"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCompany(company);
                                setIsCompanyModalOpen(true);
                              }}
                              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="সম্পাদনা"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company.id)}
                              className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD GRID VIEW */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCompanies.map(company => (
                  <div
                    key={company.id}
                    className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all space-y-4 relative group ${
                      selectedCompanyIds.includes(company.id)
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectCompany(company.id)}
                          className={`mt-0.5 p-1.5 rounded-lg border transition-all shrink-0 ${
                            selectedCompanyIds.includes(company.id)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-300 border-slate-200 hover:border-indigo-400 hover:text-indigo-500'
                          }`}
                          title={selectedCompanyIds.includes(company.id) ? "আনচেক করুন" : "প্রতিষ্ঠান নির্বাচন করুন"}
                        >
                          {selectedCompanyIds.includes(company.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-bold">
                              সার্কেল - {company.circle}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                company.auditStatus === 'অডিট সম্পন্ন'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : company.auditStatus === 'আপত্তি উত্থাপিত'
                                  ? 'bg-rose-100 text-rose-800'
                                  : company.auditStatus === 'অডিট চলমান'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {company.auditStatus} {company.auditYear ? `(${company.auditYear})` : ''}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {company.companyName}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{company.address}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setPrefilledHearingCompany(company);
                            setEditingNotice(null);
                            setIsHearingModalOpen(true);
                          }}
                          title="এই প্রতিষ্ঠানের জন্য শুনানীর চিঠি প্রস্তুত করুন"
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">শুনানির চিঠি</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingCompany(company);
                            setIsCompanyModalOpen(true);
                          }}
                          title="সম্পাদনা"
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          title="মুছে ফেলুন"
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ID & Arrears strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl text-xs border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">বন্ড লাইসেন্স নং</span>
                        <span className="font-semibold text-slate-800">{company.bondLicenseNo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">বিআইএন (BIN)</span>
                        <span className="font-semibold text-slate-800">{company.bin || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">বকেয়া (টাকা)</span>
                        <span className="font-bold text-rose-600">
                          ৳ {formatCurrencyCrore(company.arrearsCrore)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">সংশ্লিষ্ট মামলা</span>
                        <span className="font-medium text-slate-700 truncate block">
                          {company.linkedCaseNos || 'নেই'}
                        </span>
                      </div>
                    </div>

                    {/* Latest Audit Information Strip */}
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>সর্বশেষ অডিট তথ্য ও স্থিতি:</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            company.auditStatus === 'অডিট সম্পন্ন'
                              ? 'bg-emerald-100 text-emerald-800'
                              : company.auditStatus === 'আপত্তি উত্থাপিত'
                              ? 'bg-rose-100 text-rose-800'
                              : company.auditStatus === 'অডিট চলমান'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {company.auditStatus} {company.auditYear ? `(${company.auditYear})` : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-slate-500 block">সর্বশেষ অডিট তারিখ:</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            {company.lastAuditDate || 'অনির্ধারিত'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">দায়িত্বপ্রাপ্ত অডিটর:</span>
                          <span className="font-semibold text-slate-800 truncate block mt-0.5">
                            {company.auditOfficer || '—'}
                          </span>
                        </div>
                      </div>
                      {company.auditObservations && (
                        <div className="text-[11px] text-amber-900 bg-amber-50/90 p-2 rounded-lg border border-amber-200/60 mt-1">
                          <span className="font-bold">অডিট পর্যবেক্ষণ: </span>
                          {company.auditObservations}
                        </div>
                      )}
                    </div>

                    {/* Two Column: Commercial Manager & Officers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Commercial Manager Card */}
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                          <span>কমার্শিয়াল ম্যানেজার</span>
                        </div>
                        <p className="font-semibold text-slate-800">{company.commercialManagerName || 'নাম এন্ট্রি নেই'}</p>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                          {company.commercialManagerMobile && (
                            <a
                              href={`tel:${company.commercialManagerMobile}`}
                              className="flex items-center gap-1.5 hover:text-indigo-600"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{company.commercialManagerMobile}</span>
                            </a>
                          )}
                          {company.commercialManagerEmail && (
                            <a
                              href={`mailto:${company.commercialManagerEmail}`}
                              className="flex items-center gap-1.5 hover:text-indigo-600"
                            >
                              <Mail className="w-3 h-3 text-blue-600" />
                              <span>{company.commercialManagerEmail}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Assigned Circle Officials Card */}
                      <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-200/50 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                          <Users className="w-3.5 h-3.5 text-indigo-700" />
                          <span>দায়িত্বপ্রাপ্ত কর্মকর্তাবৃন্দ</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 font-medium">ARO:</span>
                            <span className="font-semibold truncate max-w-[170px]">{company.officerARO || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 font-medium">RO:</span>
                            <span className="font-semibold truncate max-w-[170px]">{company.officerRO || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 font-medium">AC / DC:</span>
                            <span className="font-semibold truncate max-w-[170px]">{company.officerAC_DC || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 font-medium">JC / ADC:</span>
                            <span className="font-semibold truncate max-w-[170px]">{company.officerJC_ADC || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {company.remarks && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">মন্তব্য: </span>
                        {company.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sticky Floating Bar for Bulk Company Assignment */}
            {selectedCompanyIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold">
                    {selectedCompanyIds.length} টি প্রতিষ্ঠান নির্বাচিত
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-700"></div>
                <button
                  onClick={() => setIsBulkCompanyAssignModalOpen(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>একযোগে কর্মকর্তা নিয়োগ (Bulk Assign)</span>
                </button>
                <button
                  onClick={() => setSelectedCompanyIds([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. File Movement Register (নথি চলাচল রেজিস্টার) */}
        {activeTab === 'file_movement' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-600" />
                  <span>নথি চলাচল রেজিস্টার (File Movement Register)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  সার্কেল, সদর দপ্তর, আইন ও বিচার শাখা এবং আদালতের মধ্যে ফাইল চলাচল ট্র্যাকিং, জরুরি বার্তা ও তাৎক্ষণিক প্রাপ্তি স্বীকার
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFileMovement(null);
                  setIsFileMovementModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন নথি চলাচল এন্ট্রি</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">মোট নথি চলাচল</span>
                <span className="text-xl font-bold text-slate-900">{formatBanglaNumber(fileMovementKPIs.total)} টি</span>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60">
                <span className="text-[11px] text-blue-700 block font-medium">চলমান / ট্রানজিট</span>
                <span className="text-xl font-bold text-blue-800">{formatBanglaNumber(fileMovementKPIs.transit)} টি</span>
              </div>
              <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200/60">
                <span className="text-[11px] text-teal-700 block font-medium">গৃহীত নথি</span>
                <span className="text-xl font-bold text-teal-800">{formatBanglaNumber(fileMovementKPIs.received)} টি</span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
                <span className="text-[11px] text-emerald-700 block font-medium">নিষ্পন্ন নথি</span>
                <span className="text-xl font-bold text-emerald-800">{formatBanglaNumber(fileMovementKPIs.resolved)} টি</span>
              </div>
              <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/60">
                <span className="text-[11px] text-rose-700 block font-medium">ফেরত প্রেরিত</span>
                <span className="text-xl font-bold text-rose-800">{formatBanglaNumber(fileMovementKPIs.returned)} টি</span>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                <span className="text-[11px] text-amber-800 block font-medium">জরুরি ও অতি জরুরি</span>
                <span className="text-xl font-bold text-amber-900">{formatBanglaNumber(fileMovementKPIs.urgent)} টি</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 mr-1">স্থিতি:</span>
                {[
                  { id: 'all', label: 'সকল স্থিতি' },
                  { id: 'চলমান/পথিমধ্যে', label: 'চলমান/পথিমধ্যে' },
                  { id: 'গৃহীত', label: 'গৃহীত' },
                  { id: 'নিষ্পন্ন', label: 'নিষ্পন্ন' },
                  { id: 'ফেরত প্রেরিত', label: 'ফেরত প্রেরিত' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFileMovementStatusFilter(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      fileMovementStatusFilter === item.id
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 mr-1">গুরুত্ব:</span>
                {[
                  { id: 'all', label: 'সকল' },
                  { id: 'সাধারণ', label: 'সাধারণ' },
                  { id: 'জরুরি', label: 'জরুরি' },
                  { id: 'অতি জরুরি', label: 'অতি জরুরি' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFileMovementUrgencyFilter(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      fileMovementUrgencyFilter === item.id
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {filteredFileMovements.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Send className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন নথি চলাচলের রেকর্ড পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-0.5">নতুন মুভমেন্ট যুক্ত করতে ওপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 min-w-[150px]">নথি নম্বর ও সার্কেল</th>
                      <th className="p-3 min-w-[180px]">সংশ্লিষ্ট প্রতিষ্ঠান</th>
                      <th className="p-3 min-w-[200px]">বিষয়বস্তু</th>
                      <th className="p-3 min-w-[170px]">প্রেরক শাখা ও কর্মকর্তা</th>
                      <th className="p-3 min-w-[170px]">প্রাপক শাখা ও কর্মকর্তা</th>
                      <th className="p-3 min-w-[120px]">প্রেরণ ও প্রাপ্তি</th>
                      <th className="p-3 text-center min-w-[100px]">গুরুত্ব</th>
                      <th className="p-3 text-center min-w-[110px]">বর্তমান স্থিতি</th>
                      <th className="p-3 text-center min-w-[130px]">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFileMovements.map(record => (
                      <tr key={record.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {record.fileNo}
                          </span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold text-[10px]">
                            সার্কেল - {record.circle}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{record.companyName || '—'}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-900 line-clamp-2">{record.subject}</p>
                          {record.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                              নোট: {record.notes}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{record.senderBranch}</p>
                          <p className="text-[11px] text-slate-500">{record.senderOfficer || '—'}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{record.receiverBranch}</p>
                          <p className="text-[11px] text-slate-500">{record.receiverOfficer || '—'}</p>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-slate-600 block">
                              প্রেরণ: <strong className="font-semibold">{record.dispatchDate}</strong>
                            </span>
                            {record.receivedDate ? (
                              <span className="text-teal-700 font-semibold block">
                                প্রাপ্তি: {record.receivedDate}
                              </span>
                            ) : (
                              <span className="text-amber-600 text-[10px] block">অপেক্ষমান</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              record.urgency === 'অতি জরুরি'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                : record.urgency === 'জরুরি'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {record.urgency}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              record.status === 'চলমান/পথিমধ্যে'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : record.status === 'গৃহীত'
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : record.status === 'নিষ্পন্ন'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {record.status === 'চলমান/পথিমধ্যে' && (
                              <button
                                onClick={() => handleMarkMovementReceived(record.id)}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                title="নথি প্রাপ্তি স্বীকার করুন"
                              >
                                <Check className="w-3 h-3" />
                                <span>গৃহীত</span>
                              </button>
                            )}
                            {record.status === 'গৃহীত' && (
                              <button
                                onClick={() => handleMarkMovementResolved(record.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                title="নিষ্পন্ন মার্ক করুন"
                              >
                                <CheckCheck className="w-3 h-3" />
                                <span>নিষ্পন্ন</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingFileMovement(record);
                                setIsFileMovementModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                              title="সম্পাদনা"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFileMovement(record.id)}
                              className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Officer Directory (কর্মকর্তা ডিরেক্টরি) */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>কর্মকর্তাবৃন্দ ডিরেক্টরি (Officer Directory)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  কমিশনারেটের কর্মকর্তা তালিকা, যোগাযোগের মোবাইল ও ইমেইল, পদায়নকৃত সার্কেল এবং কক্ষ নম্বর
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOfficer(null);
                  setIsOfficerEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন কর্মকর্তা যোগ</span>
              </button>
            </div>

            {/* Designation Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setOfficerDesignationFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  officerDesignationFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                সকল কর্মকর্তা ({officerCounts.all})
              </button>
              <button
                onClick={() => setOfficerDesignationFilter('ARO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  officerDesignationFilter === 'ARO'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                সহকারী রাজস্ব কর্মকর্তা - ARO ({officerCounts.ARO})
              </button>
              <button
                onClick={() => setOfficerDesignationFilter('RO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  officerDesignationFilter === 'RO'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                রাজস্ব কর্মকর্তা - RO ({officerCounts.RO})
              </button>
              <button
                onClick={() => setOfficerDesignationFilter('AC_DC')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  officerDesignationFilter === 'AC_DC'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
                }`}
              >
                সহকারী / উপ-কমিশনার - AC/DC ({officerCounts.AC_DC})
              </button>
              <button
                onClick={() => setOfficerDesignationFilter('JC_ADC')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  officerDesignationFilter === 'JC_ADC'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                যুগ্ম / অতিরিক্ত কমিশনার - JC/ADC ({officerCounts.JC_ADC})
              </button>
            </div>

            {/* Officer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficers.map(officer => {
                const badgeColor =
                  officer.designation === 'ARO'
                    ? 'bg-slate-100 text-slate-800 border-slate-200'
                    : officer.designation === 'RO'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : officer.designation === 'AC' || officer.designation === 'DC'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-purple-100 text-purple-800 border-purple-200';

                return (
                  <div
                    key={officer.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-5 shadow-xs hover:shadow-lg transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${badgeColor}`}>
                            {officer.designation}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              officer.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : officer.status === 'leave'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {officer.status === 'active' ? 'কর্মরত' : officer.status === 'leave' ? 'ছুটিতে' : 'বদলি'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{officer.name}</h4>
                        <p className="text-xs text-slate-500">{officer.designationBangla}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingOfficer(officer);
                            setIsOfficerEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="তথ্য আপডেট"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact & Room Details */}
                    <div className="space-y-1.5 text-xs">
                      {officer.mobile && (
                        <a
                          href={`tel:${officer.mobile}`}
                          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{officer.mobile}</span>
                        </a>
                      )}
                      {officer.email && (
                        <a
                          href={`mailto:${officer.email}`}
                          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{officer.email}</span>
                        </a>
                      )}
                      {officer.roomNo && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>কক্ষ নং: {officer.roomNo}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Circles & Companies */}
                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">নিযুক্ত সার্কেল:</span>
                        <div className="flex flex-wrap gap-1">
                          {officer.assignedCircles && officer.assignedCircles.length > 0 ? (
                            officer.assignedCircles.map(c => (
                              <span
                                key={c}
                                className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px]"
                              >
                                সার্কেল-{c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">কোন সার্কেলে নেই</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">অ্যাসাইনকৃত প্রতিষ্ঠান:</span>
                        <span className="font-bold text-slate-800">
                          {officer.assignedCompanyIds?.length || 0} টি
                        </span>
                      </div>
                    </div>

                    {/* Quick Assign Action */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenSingleAssignOfficerModal(officer)}
                        className="w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-sky-200"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>সার্কেল ও প্রতিষ্ঠান বণ্টন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* 2. Checklist & Workflow */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  সার্কেল ও শাখার কার্যপ্রবাহ চেকলিস্ট (Action Checklist)
                </h3>
                <p className="text-xs text-slate-500">
                  কখন কোন কাজ করতে হবে তা চেকলিস্ট আকারে পর্যবেক্ষণ, সময়সীমা এবং সম্পন্ন চিহ্নিতকরণ
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন কাজ / চেকলিস্ট যুক্ত করুন</span>
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন চেকলিস্ট টাস্ক নেই</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-500 bg-white'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority === 'high' ? 'জরুরি' : task.priority === 'medium' ? 'সাধারণ' : 'স্বাভাবিক'}
                            </span>

                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-medium">
                              সার্কেল-{task.circle}
                            </span>

                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">
                              {task.taskType}
                            </span>
                          </div>

                          <h4
                            className={`text-sm font-semibold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            {task.companyName && (
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {task.companyName}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-rose-600 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              শেষ তারিখ: {task.dueDate}
                            </span>
                            {task.assignedOfficer && (
                              <span className="flex items-center gap-1 text-indigo-700">
                                <Users className="w-3.5 h-3.5" />
                                দায়িত্ব: {task.assignedOfficer}
                              </span>
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-xs text-slate-500 bg-slate-100/70 px-2 py-1 rounded inline-block">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Hearing Notices & Letter Generator */}
        {activeTab === 'hearing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  শুনানীর নোটিশ ও চিঠি প্রস্তুতকারক
                </h3>
                <p className="text-xs text-slate-500">
                  বাংলাদেশ কাস্টমস বন্ড কমিশনারেটের আনুষ্ঠানিক স্মারক ও বিন্যাসে ১-ক্লিকে নোটিশ তৈরি ও প্রিন্ট/পিডিএফ
                </p>
              </div>
              <button
                onClick={() => {
                  setPrefilledHearingCompany(undefined);
                  setEditingNotice(null);
                  setIsHearingModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন শুনানীর চিঠি প্রস্তুত করুন</span>
              </button>
            </div>

            {filteredNotices.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Printer className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন শুনানীর চিঠি তৈরি হয়নি</p>
                <p className="text-xs text-slate-400 mt-0.5">নতুন চিঠি তৈরি করতে ওপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotices.map(notice => (
                  <div
                    key={notice.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-lg transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          স্মারক: {notice.memoNo}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{notice.companyName}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{notice.subject}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingNotice(notice);
                            setIsHearingModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>প্রিন্ট / দেখুন</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">শুনানীর তারিখ ও সময়</span>
                        <span className="font-semibold text-slate-800">
                          {notice.hearingDate} ({notice.hearingTime})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">শুনানীর স্থান</span>
                        <span className="font-medium text-slate-700 truncate block">
                          {notice.hearingLocation}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">দাবীকৃত রাজস্ব</span>
                        <span className="font-bold text-rose-600">
                          ৳ {formatBanglaNumber(notice.demandedAmountTaka || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">স্বাক্ষরকারী কর্মকর্তা</span>
                        <span className="font-medium text-slate-700 truncate block">
                          {notice.signatoryName} ({notice.signatoryDesignation})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Show Cause & Adjudication Order Tally */}
        {activeTab === 'scn' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  কারণ দর্শাও নোটিশ (SCN) ও বিচারাদেশ হিসাব খতিয়ান
                </h3>
                <p className="text-xs text-slate-500">
                  এসসিএন দাবি, জবাবের অবস্থা, বিচারাদেশের শুল্ক, অর্থদণ্ড, আদায় ও অবশিষ্ট বকেয়া রাজস্বের স্বয়ংক্রিয় হিসাব
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingScn(null);
                  setIsScnModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন কারণ দর্শাও / বিচারাদেশ এন্ট্রি</span>
              </button>
            </div>

            {filteredScnOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন কারণ দর্শাও বা বিচারাদেশের রেকর্ড পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">প্রতিষ্ঠান ও সার্কেল</th>
                      <th className="p-3">SCN নম্বর ও জারির তারিখ</th>
                      <th className="p-3 text-right">দাবীকৃত রাজস্ব (৳)</th>
                      <th className="p-3">জবাবের অবস্থা</th>
                      <th className="p-3">বিচারাদেশ নং ও তারিখ</th>
                      <th className="p-3 text-right">সর্বমোট ধার্য (৳)</th>
                      <th className="p-3 text-right">আদায় (৳)</th>
                      <th className="p-3 text-right text-rose-700">অবশিষ্ট বকেয়া (৳)</th>
                      <th className="p-3 text-center">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredScnOrders.map(item => (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{item.companyName}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            সার্কেল-{item.circle} {item.bin ? `| বিন: ${item.bin}` : ''}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{item.scnNo}</span>
                          <span className="text-[10px] text-slate-500">তারিখ: {item.scnDate}</span>
                        </td>
                        <td className="p-3 text-right font-semibold text-amber-900">
                          ৳ {formatBanglaNumber(item.demandAmountTaka)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.replyStatus === 'জবাব দাখিলকৃত'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.replyStatus === 'সময় বৃদ্ধির আবেদন'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.replyStatus}
                          </span>
                          {item.replyDeadline && (
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              ডেডলাইন: {item.replyDeadline}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{item.orderNo || 'প্রক্রিয়াধীন'}</span>
                          {item.orderDate && (
                            <span className="text-[10px] text-slate-500">তারিখ: {item.orderDate}</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ৳ {formatBanglaNumber(item.totalAdjudicatedTaka || 0)}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            শুল্ক: ৳ {formatBanglaNumber(item.adjudicatedDutyTaka || 0)} | দণ্ড: ৳ {formatBanglaNumber(item.penaltyTaka || 0)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          ৳ {formatBanglaNumber(item.realizedAmountTaka || 0)}
                        </td>
                        <td className="p-3 text-right font-bold text-rose-700">
                          ৳ {formatBanglaNumber(item.outstandingAmountTaka || 0)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingScn(item);
                                setIsScnModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScn(item.id)}
                              className="p-1 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Financial Summary Footer */}
                  <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="p-3" colSpan={2}>
                        মোট হিসাব ({filteredScnOrders.length} টি রেকর্ড)
                      </td>
                      <td className="p-3 text-right text-amber-900">
                        ৳ {formatBanglaNumber(kpis.totalScnDemand)}
                      </td>
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                      <td className="p-3 text-right text-slate-900">
                        ৳ {formatBanglaNumber(kpis.totalAdjudicated)}
                      </td>
                      <td className="p-3 text-right text-emerald-700">
                        ৳ {formatBanglaNumber(kpis.totalRealized)}
                      </td>
                      <td className="p-3 text-right text-rose-700">
                        ৳ {formatBanglaNumber(kpis.totalScnOutstanding)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Reminders & Calendar */}
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  রিমাইন্ডার ও সময়সূচি (Reminders & Alerts)
                </h3>
                <p className="text-xs text-slate-500">
                  শুনানির ফলোআপ, এসসিএন জবাবের ডেডলাইন, অডিট প্রতিবেদন ও সার্কেল কাজের অ্যালার্ট
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingReminder(null);
                  setIsReminderModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন রিমাইন্ডার যোগ করুন</span>
              </button>
            </div>

            {filteredReminders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">কোন রিমাইন্ডার সেট করা নেই</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredReminders.map(rem => (
                  <div
                    key={rem.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      rem.completed
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-purple-200/80 hover:border-purple-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">
                        সার্কেল-{rem.circle}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`p-1 rounded text-xs font-medium ${
                            rem.completed ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-sm font-bold ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {rem.title}
                    </h4>

                    {rem.companyName && (
                      <p className="text-xs text-indigo-700 font-medium">{rem.companyName}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{rem.date} {rem.time ? `(${rem.time})` : ''}</span>
                    </div>

                    {rem.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{rem.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Officer Circle Assignments & Directory */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  সার্কেল অনুযায়ী কর্মকর্তা নিয়োগ ও সিঙ্ক্রোনাইজেশন
                </h3>
                <p className="text-xs text-slate-500">
                  প্রতিটি সার্কেলের জন্য দায়িত্বপ্রাপ্ত ARO, RO, AC/DC এবং JC/ADC কর্মকর্তার তথ্য এবং সার্কেলের সকল প্রতিষ্ঠানে একযোগে সিঙ্ক করার ব্যবস্থা
                </p>
              </div>
              <button
                onClick={() => {
                  setOfficerModalCircle(selectedCircle === 'all' ? '১' : selectedCircle);
                  setIsOfficerModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>কর্মকর্তা নিয়োগ বা পরিবর্তন</span>
              </button>
            </div>

            {/* Circle Assignment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['১', '২', '৩', '৪', '৫', '৬'].map(circleNo => {
                const config = assignments.find(a => a.circle === circleNo);
                const compsCount = companies.filter(c => c.circle === circleNo).length;

                return (
                  <div
                    key={circleNo}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 p-5 shadow-sm hover:shadow-lg transition-all space-y-4 relative group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-800 text-xs font-black">
                            সার্কেল - {circleNo}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {compsCount} টি প্রতিষ্ঠান
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                          {config?.circleName || `সার্কেল-${circleNo}`}
                        </h4>
                      </div>

                      <button
                        onClick={() => {
                          setOfficerModalCircle(circleNo);
                          setIsOfficerModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        title="কর্মকর্তা পরিবর্তন করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Officers Table / Rows */}
                    <div className="space-y-2 text-xs">
                      {/* ARO */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-10 text-[10px] font-bold text-slate-500 font-mono">ARO:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                            {config?.aroName || 'নিযুক্ত নেই'}
                          </span>
                        </div>
                      </div>

                      {/* RO */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-10 text-[10px] font-bold text-slate-500 font-mono">RO:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                            {config?.roName || 'নিযুক্ত নেই'}
                          </span>
                        </div>
                      </div>

                      {/* AC / DC */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
                        <div className="flex items-center gap-1.5">
                          <span className="w-10 text-[10px] font-bold text-indigo-700 font-mono">AC/DC:</span>
                          <span className="font-semibold text-indigo-950 truncate max-w-[190px]">
                            {config?.acDcName || 'নিযুক্ত নেই'}
                          </span>
                        </div>
                      </div>

                      {/* JC / ADC */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100/80">
                        <div className="flex items-center gap-1.5">
                          <span className="w-10 text-[10px] font-bold text-purple-700 font-mono">JC/ADC:</span>
                          <span className="font-semibold text-purple-950 truncate max-w-[190px]">
                            {config?.jcAdcName || 'নিযুক্ত নেই'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSyncAssignmentToCompanies(circleNo)}
                        disabled={compsCount === 0}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          compsCount > 0
                            ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/80'
                            : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                        }`}
                        title="এই সার্কেলের সকল প্রতিষ্ঠানে কর্মকর্তাদের নাম সিঙ্ক করুন"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>প্রতিষ্ঠানে সিঙ্ক করুন ({compsCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          setOfficerModalCircle(circleNo);
                          setIsOfficerModalOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                      >
                        নিয়োগ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section 2: Designation-based Officer Directory & Assignment */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <span>পদবী ভিত্তিক কর্মকর্তা তালিকা ও প্রতিষ্ঠান অ্যাসাইনমেন্ট</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    পদবী অনুযায়ী কর্মকর্তা ফিল্টার করুন, সার্কেল ও প্রতিষ্ঠান নির্ধারণ করুন এবং প্রয়োজনে একযোগে বাল্ক সিলেকশন (Bulk Selection) করুন
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    মোট কর্মকর্তা: {officers.length} জন
                  </span>
                  <button
                    onClick={() => {
                      setEditingOfficer(null);
                      setIsOfficerEditModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন কর্মকর্তা যোগ</span>
                  </button>
                </div>
              </div>

              {/* Designation Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
                <button
                  onClick={() => setOfficerDesignationFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    officerDesignationFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  সকল কর্মকর্তা ({officerCounts.all})
                </button>
                <button
                  onClick={() => setOfficerDesignationFilter('ARO')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    officerDesignationFilter === 'ARO'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  সহকারী রাজস্ব কর্মকর্তা - ARO ({officerCounts.ARO})
                </button>
                <button
                  onClick={() => setOfficerDesignationFilter('RO')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    officerDesignationFilter === 'RO'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  রাজস্ব কর্মকর্তা - RO ({officerCounts.RO})
                </button>
                <button
                  onClick={() => setOfficerDesignationFilter('AC_DC')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    officerDesignationFilter === 'AC_DC'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  সহকারী / উপ-কমিশনার - AC/DC ({officerCounts.AC_DC})
                </button>
                <button
                  onClick={() => setOfficerDesignationFilter('JC_ADC')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    officerDesignationFilter === 'JC_ADC'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                  }`}
                >
                  যুগ্ম / অতিরিক্ত কমিশনার - JC/ADC ({officerCounts.JC_ADC})
                </button>
              </div>

              {/* Search & Bulk Selection Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={officerSearchQuery}
                    onChange={(e) => setOfficerSearchQuery(e.target.value)}
                    placeholder="কর্মকর্তার নাম, পদবি, ফোন, সার্কেল বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {officerSearchQuery && (
                    <button
                      onClick={() => setOfficerSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Bulk Select and Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={toggleSelectAllOfficers}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    {filteredOfficers.length > 0 && selectedOfficerIds.length === filteredOfficers.length ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedOfficerIds.length > 0
                        ? `${selectedOfficerIds.length} জন নির্বাচিত`
                        : 'সকল নির্বাচন করুন'}
                    </span>
                  </button>

                  {selectedOfficerIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenBulkAssignOfficerModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>সার্কেল ও প্রতিষ্ঠান অ্যাসাইন করুন ({selectedOfficerIds.length})</span>
                      </button>
                      <button
                        onClick={() => setSelectedOfficerIds([])}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                      >
                        বাতিল
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Officers Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAllOfficers}
                          className="hover:text-teal-700"
                        >
                          {filteredOfficers.length > 0 && selectedOfficerIds.length === filteredOfficers.length ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-3">কর্মকর্তার নাম</th>
                      <th className="p-3">পদবি</th>
                      <th className="p-3">নিযুক্ত সার্কেল</th>
                      <th className="p-3">অ্যাসাইনকৃত প্রতিষ্ঠান</th>
                      <th className="p-3">মোবাইল নম্বর</th>
                      <th className="p-3">ই-মেইল</th>
                      <th className="p-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOfficers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          কোন কর্মকর্তার তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredOfficers.map(officer => {
                        const isSelected = selectedOfficerIds.includes(officer.id);
                        const assignedCompsCount = officer.assignedCompanyIds?.length || 0;
                        const assignedCompsNames = officer.assignedCompanyNames || [];

                        return (
                          <tr
                            key={officer.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSelectOfficer(officer.id)}
                                className="hover:text-teal-700"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-teal-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{officer.name}</div>
                              {officer.roomNo && (
                                <div className="text-[10px] text-slate-400">কক্ষ নং: {officer.roomNo}</div>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  officer.designation === 'ARO'
                                    ? 'bg-slate-100 text-slate-800'
                                    : officer.designation === 'RO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : officer.designation === 'AC' || officer.designation === 'DC'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {officer.designationBangla}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {officer.assignedCircles && officer.assignedCircles.length > 0 ? (
                                  officer.assignedCircles.map(c => (
                                    <span
                                      key={c}
                                      className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold"
                                    >
                                      সার্কেল-{c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              {assignedCompsCount > 0 ? (
                                <div className="space-y-1">
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold"
                                    title={assignedCompsNames.join(', ')}
                                  >
                                    <Building2 className="w-3 h-3" />
                                    <span>{assignedCompsCount} টি প্রতিষ্ঠান</span>
                                  </span>
                                  <div
                                    className="text-[10px] text-slate-500 max-w-[200px] truncate"
                                    title={assignedCompsNames.join(', ')}
                                  >
                                    {assignedCompsNames.slice(0, 2).join(', ')}
                                    {assignedCompsCount > 2 ? ` +${assignedCompsCount - 2}` : ''}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">নির্ধারিত নেই</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-700">
                              {officer.mobile ? (
                                <a href={`tel:${officer.mobile}`} className="hover:text-teal-700 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-teal-600" />
                                  <span>{officer.mobile}</span>
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-700">
                              {officer.email ? (
                                <a href={`mailto:${officer.email}`} className="hover:text-teal-700 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <span>{officer.email}</span>
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingOfficer(officer);
                                    setIsOfficerEditModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="কর্মকর্তার নাম, পদবি, মোবাইল ও ই-মেইল আপডেট করুন"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>তথ্য আপডেট</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSingleAssignOfficerModal(officer)}
                                  className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="এই কর্মকর্তার সার্কেল ও প্রতিষ্ঠান অ্যাসাইন করুন"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>অ্যাসাইন</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOfficer(officer.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sticky Floating Bar for Bulk Officer Assignment */}
            {selectedOfficerIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <span className="text-xs font-bold">
                    {selectedOfficerIds.length} জন কর্মকর্তা নির্বাচিত
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-700"></div>
                <button
                  onClick={handleOpenBulkAssignOfficerModal}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>সার্কেল ও প্রতিষ্ঠান একযোগে অ্যাসাইন করুন ({selectedOfficerIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedOfficerIds([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CompanyProfileModal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        initialData={editingCompany}
        assignments={assignments}
      />

      <HearingNoticeModal
        isOpen={isHearingModalOpen}
        onClose={() => {
          setIsHearingModalOpen(false);
          setEditingNotice(null);
          setPrefilledHearingCompany(undefined);
        }}
        onSave={handleSaveNotice}
        initialNotice={editingNotice}
        companies={companies}
        prefilledCompany={prefilledHearingCompany}
      />

      <ShowCauseModal
        isOpen={isScnModalOpen}
        onClose={() => {
          setIsScnModalOpen(false);
          setEditingScn(null);
        }}
        onSave={handleSaveScn}
        record={editingScn}
        companies={companies}
      />

      <CircleTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        companies={companies}
      />

      <CircleReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
        reminder={editingReminder}
        companies={companies}
      />

      <OfficerAssignmentModal
        isOpen={isOfficerModalOpen}
        onClose={() => setIsOfficerModalOpen(false)}
        assignments={assignments}
        officers={officers}
        onSaveAssignment={handleSaveAssignment}
        onSaveOfficer={handleSaveOfficer}
        initialCircle={officerModalCircle}
        totalCompaniesInCircle={companies.filter(c => c.circle === officerModalCircle).length}
      />

      {/* Officer Assignment Modal (Circles and Companies) */}
      <AssignOfficerModal
        isOpen={isAssignOfficerModalOpen}
        onClose={() => {
          setIsAssignOfficerModalOpen(false);
          setOfficersToAssign([]);
        }}
        officers={officersToAssign}
        companies={companies}
        onSaveAssignment={handleSaveOfficerAssignment}
      />

      {/* Bulk Company Assign Modal (ARO, RO, AC/DC, JC/ADC to Companies) */}
      <BulkCompanyAssignModal
        isOpen={isBulkCompanyAssignModalOpen}
        onClose={() => setIsBulkCompanyAssignModalOpen(false)}
        selectedCompanyIds={selectedCompanyIds}
        companies={companies}
        officers={officers}
        onApply={handleApplyBulkCompanyAssign}
      />

      {/* Officer Information Edit / Update Modal */}
      <OfficerEditModal
        isOpen={isOfficerEditModalOpen}
        onClose={() => {
          setIsOfficerEditModalOpen(false);
          setEditingOfficer(null);
        }}
        officer={editingOfficer}
        onSave={handleSaveOfficerInfo}
      />

      {/* Circle Management & Settings Modal */}
      <CircleSettingsModal
        isOpen={isCircleSettingsOpen}
        onClose={() => setIsCircleSettingsOpen(false)}
        assignments={assignments}
        officers={officers}
        onSaveCircleConfig={handleSaveCircleConfig}
        initialCircle={circleSettingsInitialCircle}
      />

      {/* File Movement Register Modal */}
      <FileMovementModal
        isOpen={isFileMovementModalOpen}
        onClose={() => {
          setIsFileMovementModalOpen(false);
          setEditingFileMovement(null);
        }}
        onSave={handleSaveFileMovement}
        initialData={editingFileMovement}
        companies={companies}
        officers={officers}
        defaultCircle={selectedCircle === 'all' ? '১' : selectedCircle}
      />

    </div>
  );
};
