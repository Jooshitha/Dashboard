import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Flame,
  HandCoins,
  HelpCircle,
  Home,
  LogOut,
  Moon,
  PiggyBank,
  Settings,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'
import './App.css'

type AppTab = 'dashboard' | 'transactions' | 'insights' | 'settings'

type TransactionType = 'income' | 'expense'

type Category =
  | 'Salary'
  | 'Investments'
  | 'EMI'
  | 'Rent'
  | 'Groceries'
  | 'Utilities'
  | 'Travel'
  | 'Dining'
  | 'Insurance'

type Transaction = {
  id: number
  date: string
  description: string
  category: Category
  type: TransactionType
  amount: number
  status: 'Settled' | 'Pending' | 'Scheduled'
}

type SavingsGoal = {
  id: number
  title: string
  target: number
  saved: number
  deadline: string
}

type ExportFormat = 'csv' | 'json' | 'txt'

type DateRange = '30d' | '90d' | '365d'

const tabs: { key: AppTab; label: string; icon: LucideIcon }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
  { key: 'insights', label: 'Insights', icon: TrendingUp },
  { key: 'settings', label: 'Settings', icon: Settings },
]

const allCategories: Array<Category | 'All'> = [
  'All',
  'Salary',
  'Investments',
  'EMI',
  'Rent',
  'Groceries',
  'Utilities',
  'Travel',
  'Dining',
  'Insurance',
]

const cashFlowSeries = [
  { month: 'Nov', income: 255000, spend: 182000 },
  { month: 'Dec', income: 265000, spend: 191000 },
  { month: 'Jan', income: 262000, spend: 188000 },
  { month: 'Feb', income: 278000, spend: 196000 },
  { month: 'Mar', income: 272000, spend: 201000 },
  { month: 'Apr', income: 289000, spend: 205000 },
]

const insightSeries = {
  q1: { income: [2.2, 2.4, 2.3], expense: [1.5, 1.6, 1.55] },
  q2: { income: [2.35, 2.5, 2.65], expense: [1.62, 1.71, 1.8] },
  q3: { income: [2.5, 2.62, 2.78], expense: [1.72, 1.8, 1.89] },
  q4: { income: [2.62, 2.74, 2.92], expense: [1.85, 1.92, 2.0] },
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: '2026-04-04',
    description: 'Monthly Salary Credit - Product Lead',
    category: 'Salary',
    type: 'income',
    amount: 275000,
    status: 'Settled',
  },
  {
    id: 2,
    date: '2026-04-03',
    description: 'SIP Dividend Payout',
    category: 'Investments',
    type: 'income',
    amount: 19500,
    status: 'Settled',
  },
  {
    id: 3,
    date: '2026-04-02',
    description: 'Home Loan EMI - HDFC',
    category: 'EMI',
    type: 'expense',
    amount: 48500,
    status: 'Settled',
  },
  {
    id: 4,
    date: '2026-04-01',
    description: 'Premium Apartment Rent',
    category: 'Rent',
    type: 'expense',
    amount: 65000,
    status: 'Settled',
  },
  {
    id: 5,
    date: '2026-03-30',
    description: 'Weekly Groceries - Nature Basket',
    category: 'Groceries',
    type: 'expense',
    amount: 9200,
    status: 'Settled',
  },
  {
    id: 6,
    date: '2026-03-28',
    description: 'Electricity + Broadband Bill',
    category: 'Utilities',
    type: 'expense',
    amount: 7200,
    status: 'Pending',
  },
  {
    id: 7,
    date: '2026-03-25',
    description: 'Flight Booking - Bengaluru',
    category: 'Travel',
    type: 'expense',
    amount: 18500,
    status: 'Scheduled',
  },
  {
    id: 8,
    date: '2026-03-22',
    description: 'Team Dinner - Korean BBQ',
    category: 'Dining',
    type: 'expense',
    amount: 5600,
    status: 'Settled',
  },
  {
    id: 9,
    date: '2026-03-18',
    description: 'Health Insurance Premium',
    category: 'Insurance',
    type: 'expense',
    amount: 21000,
    status: 'Settled',
  },
]

const formatInr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const getCategoryVisual = (category: Category): { icon: LucideIcon; tone: string } => {
  if (category === 'Salary' || category === 'Investments') return { icon: Building2, tone: 'metric-cyan' }
  if (category === 'Rent') return { icon: Home, tone: 'metric-purple' }
  if (category === 'EMI' || category === 'Utilities') return { icon: CreditCard, tone: 'metric-rose' }
  if (category === 'Travel') return { icon: Calendar, tone: 'metric-purple' }
  if (category === 'Groceries' || category === 'Dining') return { icon: HandCoins, tone: 'metric-cyan' }
  return { icon: Flame, tone: 'metric-rose' }
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard')
  const [isDark, setIsDark] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [kind, setKind] = useState<'all' | TransactionType>('all')
  const [range, setRange] = useState<DateRange>('30d')
  const [showAdd, setShowAdd] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchMenu, setShowSearchMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [openFilter, setOpenFilter] = useState<'category' | 'kind' | 'range' | null>(null)
  const [tablePage, setTablePage] = useState(1)
  const [noticeCount, setNoticeCount] = useState(3)
  const [insightQuarter, setInsightQuarter] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q2')
  const [cashFlowRange, setCashFlowRange] = useState<'3m' | '6m'>('6m')
  const [feedback, setFeedback] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: 1, title: 'Goa Vacation', target: 120000, saved: 46000, deadline: '2026-12-20' },
    { id: 2, title: 'Buy New Phone', target: 95000, saved: 30000, deadline: '2026-08-30' },
  ])

  const [draft, setDraft] = useState({
    date: '2026-04-06',
    description: '',
    category: 'Utilities' as Category,
    type: 'expense' as TransactionType,
    amount: 0,
  })
  const [goalDraft, setGoalDraft] = useState({
    title: '',
    target: 0,
    saved: 0,
    deadline: '2026-12-31',
  })

  const cutoffDate = useMemo(() => {
    const now = new Date('2026-04-06')
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - days)
    return cutoff
  }, [range])

  const filtered = useMemo(() => {
    const shouldApplySearch = activeTab === 'transactions'
    return transactions.filter((tx) => {
      const bySearch =
        !shouldApplySearch ||
        !query.trim() ||
        `${tx.description} ${tx.category}`.toLowerCase().includes(query.toLowerCase())
      const byCategory = category === 'All' || tx.category === category
      const byType = kind === 'all' || tx.type === kind
      const byDate = new Date(tx.date) >= cutoffDate
      return bySearch && byCategory && byType && byDate
    })
  }, [transactions, query, category, kind, cutoffDate, activeTab])

  const tablePageSize = 6
  const tableTotalPages = Math.max(1, Math.ceil(filtered.length / tablePageSize))
  const paginatedFiltered = filtered.slice(
    (tablePage - 1) * tablePageSize,
    tablePage * tablePageSize,
  )
  const dashboardPreviewRows = transactions.slice(0, 3)
  const remainingRowsCount = Math.max(0, transactions.length - dashboardPreviewRows.length)

  useEffect(() => {
    if (tablePage > tableTotalPages) {
      setTablePage(tableTotalPages)
    }
  }, [tablePage, tableTotalPages])

  useEffect(() => {
    setTablePage(1)
  }, [query, category, kind, range])

  useEffect(() => {
    if (!isAdmin) {
      setShowAdd(false)
    }
  }, [isAdmin])

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      return { tabMatches: [] as typeof tabs, txMatches: [] as Transaction[] }
    }
    const tabMatches = tabs.filter((tab) => tab.label.toLowerCase().includes(term))
    const txMatches = transactions
      .filter((tx) =>
        `${tx.description} ${tx.category} ${tx.type} ${tx.date}`.toLowerCase().includes(term),
      )
      .slice(0, 6)
    return { tabMatches, txMatches }
  }, [query, transactions])

  const totals = useMemo(() => {
    const income = filtered
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = filtered
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    return { income, expense, net: income - expense }
  }, [filtered])

  const salaryIncome = filtered
    .filter((tx) => tx.type === 'income' && tx.category === 'Salary')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const fixedCosts = filtered
    .filter(
      (tx) =>
        tx.type === 'expense' &&
        (tx.category === 'Rent' || tx.category === 'EMI' || tx.category === 'Insurance'),
    )
    .reduce((sum, tx) => sum + tx.amount, 0)
  const monthlyTakeHome = totals.net || 120500
  const emergencyFund = 420000
  const expenseToSalaryRatio = Math.round((totals.expense / Math.max(salaryIncome || 275000, 1)) * 100)
  const baselineSalary = salaryIncome || 275000
  const spentPct = Math.min(100, Math.round((totals.expense / Math.max(baselineSalary, 1)) * 100))
  const remainingToSave = Math.max(baselineSalary - totals.expense, 0)
  const disciplineScore = spentPct <= 65 ? 'A' : spentPct <= 75 ? 'A-' : spentPct <= 85 ? 'B' : 'C'
  const activeCashFlowSeries = cashFlowRange === '3m' ? cashFlowSeries.slice(-3) : cashFlowSeries
  const avgCashIncome = Math.round(
    activeCashFlowSeries.reduce((sum, row) => sum + row.income, 0) / activeCashFlowSeries.length,
  )
  const avgCashSpend = Math.round(
    activeCashFlowSeries.reduce((sum, row) => sum + row.spend, 0) / activeCashFlowSeries.length,
  )
  const avgCashSavings = avgCashIncome - avgCashSpend
  const cashFlowChartMax = Math.max(...activeCashFlowSeries.map((row) => row.income)) + 15000
  const bestCashMonth = activeCashFlowSeries.reduce((best, row) =>
    row.income - row.spend > best.income - best.spend ? row : best,
  )
  const expenseMix = [
    {
      label: 'Rent + Maintenance',
      tone: 'violet' as const,
      color: '#4f46e5',
      amount: filtered
        .filter((tx) => tx.type === 'expense' && (tx.category === 'Rent' || tx.category === 'EMI'))
        .reduce((sum, tx) => sum + tx.amount, 0),
    },
    {
      label: 'Groceries + Utilities',
      tone: 'mint' as const,
      color: '#10b981',
      amount: filtered
        .filter(
          (tx) => tx.type === 'expense' && (tx.category === 'Groceries' || tx.category === 'Utilities'),
        )
        .reduce((sum, tx) => sum + tx.amount, 0),
    },
    {
      label: 'Transport + Fuel',
      tone: 'powder' as const,
      color: '#8b9cf4',
      amount: filtered
        .filter((tx) => tx.type === 'expense' && tx.category === 'Travel')
        .reduce((sum, tx) => sum + tx.amount, 0),
    },
    {
      label: 'Family + Healthcare',
      tone: 'rose' as const,
      color: '#ef7d9f',
      amount: filtered
        .filter((tx) => tx.type === 'expense' && tx.category === 'Insurance')
        .reduce((sum, tx) => sum + tx.amount, 0),
    },
    {
      label: 'Dining + Lifestyle',
      tone: 'amber' as const,
      color: '#f59e0b',
      amount: filtered
        .filter((tx) => tx.type === 'expense' && tx.category === 'Dining')
        .reduce((sum, tx) => sum + tx.amount, 0),
    },
  ].map((item) => ({
    ...item,
    pctSalary: Math.round((item.amount / Math.max(baselineSalary, 1)) * 100),
    pctSpend: totals.expense > 0 ? Math.round((item.amount / totals.expense) * 100) : 0,
  }))
  const allocatedSalaryPct = expenseMix.reduce((sum, item) => sum + item.pctSalary, 0)
  const unspentSalaryPct = Math.max(0, 100 - allocatedSalaryPct)
  const expenseLegend = [
    ...expenseMix,
    {
      label: 'Available to Save',
      tone: 'slate' as const,
      color: '#22d3ee',
      amount: remainingToSave,
      pctSalary: unspentSalaryPct,
      pctSpend: 0,
    },
  ]
  const expenseDonutGradient = useMemo(() => {
    let cursor = 0
    const segments = expenseMix
      .filter((item) => item.pctSalary > 0)
      .map((item) => {
        const start = cursor
        cursor += item.pctSalary
        return `${item.color} ${start}% ${cursor}%`
      })
    if (unspentSalaryPct > 0) {
      const start = cursor
      cursor += unspentSalaryPct
      segments.push(`#22d3ee ${start}% ${cursor}%`)
    }
    return `conic-gradient(${segments.join(', ')})`
  }, [expenseMix, unspentSalaryPct])

  const exportData = (format: ExportFormat) => {
    const fileRows = filtered.map((tx) => ({
      date: tx.date,
      description: tx.description,
      category: tx.category,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
    }))

    const makeDownload = (content: string, extension: ExportFormat, mime: string) => {
      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `precision-ledger-transactions.${extension}`
      link.click()
      URL.revokeObjectURL(url)
    }

    if (format === 'json') {
      makeDownload(JSON.stringify(fileRows, null, 2), 'json', 'application/json;charset=utf-8;')
      setFeedback('Exported transactions in JSON format.')
      return
    }

    if (format === 'txt') {
      const txtLines = fileRows
        .map(
          (tx) =>
            `${tx.date} | ${tx.description} | ${tx.category} | ${tx.type.toUpperCase()} | ${formatInr(tx.amount)} | ${tx.status}`,
        )
        .join('\n')
      makeDownload(txtLines, 'txt', 'text/plain;charset=utf-8;')
      setFeedback('Exported transactions in TXT format.')
      return
    }

    const header = 'Date,Description,Category,Type,Amount,Status\n'
    const lines = fileRows
      .map(
        (tx) =>
          `${tx.date},"${tx.description}",${tx.category},${tx.type},${tx.amount},${tx.status}`,
      )
      .join('\n')
    makeDownload(header + lines, 'csv', 'text/csv;charset=utf-8;')
    setFeedback('Exported transactions CSV successfully.')
  }

  const onSearchSelectTransaction = (tx: Transaction) => {
    setActiveTab('transactions')
    setRange('365d')
    setCategory('All')
    setKind('all')
    setQuery(tx.description.split(' - ')[0])
    setShowSearchMenu(false)
  }

  const onAddTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAdmin) {
      setFeedback('Viewer mode is read-only. Switch to Admin Mode to add transactions.')
      return
    }
    if (!draft.description || draft.amount <= 0) {
      setFeedback('Please add description and amount before saving.')
      return
    }
    const newTx: Transaction = {
      id: Date.now(),
      date: draft.date,
      description: draft.description,
      category: draft.category,
      type: draft.type,
      amount: draft.amount,
      status: 'Pending',
    }
    setTransactions((prev) => [newTx, ...prev])
    setShowAdd(false)
    setFeedback('Transaction added to your ledger.')
    setDraft({
      date: '2026-04-06',
      description: '',
      category: 'Utilities',
      type: 'expense',
      amount: 0,
    })
  }

  const onAddSavingsGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAdmin) {
      setFeedback('Viewer mode is read-only. Switch to Admin Mode to add savings goals.')
      return
    }
    if (!goalDraft.title.trim() || goalDraft.target <= 0) {
      setFeedback('Please enter goal title and target amount.')
      return
    }
    setSavingsGoals((prev) => [
      {
        id: Date.now(),
        title: goalDraft.title.trim(),
        target: goalDraft.target,
        saved: goalDraft.saved,
        deadline: goalDraft.deadline,
      },
      ...prev,
    ])
    setGoalDraft({ title: '', target: 0, saved: 0, deadline: '2026-12-31' })
    setFeedback('Savings goal created successfully.')
  }

  const updateTransactionStatus = (id: number, status: Transaction['status']) => {
    if (!isAdmin) return
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, status } : tx)))
    setFeedback('Transaction status updated.')
  }

  const deleteTransaction = (id: number) => {
    if (!isAdmin) return
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    setFeedback('Transaction removed from table.')
  }

  const clearFilters = () => {
    setCategory('All')
    setKind('all')
    setRange('30d')
    setQuery('')
    setFeedback('Filters reset to default view.')
  }

  const insights = insightSeries[insightQuarter]
  const insightIncomeTotal = insights.income.reduce((sum, val) => sum + val, 0) * 1000000
  const insightExpenseTotal = insights.expense.reduce((sum, val) => sum + val, 0) * 1000000
  const insightNetTotal = insightIncomeTotal - insightExpenseTotal
  const insightSavingsAvg = insightNetTotal / insights.income.length
  const insightMonths =
    insightQuarter === 'q1'
      ? ['Jan', 'Feb', 'Mar']
      : insightQuarter === 'q2'
        ? ['Apr', 'May', 'Jun']
        : insightQuarter === 'q3'
          ? ['Jul', 'Aug', 'Sep']
          : ['Oct', 'Nov', 'Dec']
  const bestMonthIndex = insights.income
    .map((point, idx) => point - insights.expense[idx])
    .reduce((bestIdx, val, idx, arr) => (val > arr[bestIdx] ? idx : bestIdx), 0)

  const selectedCategoryLabel = category === 'All' ? 'All Categories' : category
  const selectedKindLabel =
    kind === 'all' ? 'All Types' : kind === 'income' ? 'Income Only' : 'Expense Only'
  const selectedRangeLabel =
    range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last 12 Months'

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1080

  const renderDesktopDashboard = () => (
    <section className="tab-panel">
      <div className="summary-row dashboard-title-row">
        <div>
          <p className="muted label">THIS MONTH TAKE-HOME</p>
          <h2>{formatInr(monthlyTakeHome)}</h2>
        </div>
        {isAdmin ? (
          <button className="cta" onClick={() => setShowAdd(true)}>
            + Add Transaction
          </button>
        ) : (
          <span className="chip">Viewer mode: read-only</span>
        )}
      </div>

      <div className="cards three desktop-metrics">
        <article className="card metric-card">
          <div className="metric-content">
            <div className="metric-left">
              <div className="metric-icon metric-purple">
                <Wallet size={18} />
              </div>
              <p>Emergency Fund</p>
              <h3>{formatInr(emergencyFund)}</h3>
              <span className="chip green">2.4 months runway</span>
            </div>
            <div className="metric-right">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(124, 58, 237, 0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="8" strokeDasharray="75.4 100.5" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="20" fontWeight="700" fill="#7c3aed">75%</text>
                </svg>
              </div>
              <p className="metric-label">Funded</p>
              <span className="trend positive">+12% YoY</span>
            </div>
          </div>
        </article>
        <article className="card metric-card">
          <div className="metric-content">
            <div className="metric-left">
              <div className="metric-icon metric-cyan">
                <TrendingUp size={18} />
              </div>
              <p>Salary Credits (Monthly)</p>
              <h3>{formatInr(salaryIncome || 275000)}</h3>
              <span className="chip green">Primary income</span>
            </div>
            <div className="metric-right">
              <div className="mini-chart">
                <div className="bar" style={{height: '30%'}}></div>
                <div className="bar" style={{height: '50%'}}></div>
                <div className="bar" style={{height: '48%'}}></div>
                <div className="bar" style={{height: '65%'}}></div>
                <div className="bar" style={{height: '72%'}}></div>
                <div className="bar" style={{height: '85%'}}></div>
              </div>
              <p className="metric-label">Last 6 months</p>
              <span className="trend positive">+8.5% avg</span>
            </div>
          </div>
        </article>
        <article className="card metric-card">
          <div className="metric-content">
            <div className="metric-left">
              <div className="metric-icon metric-rose">
                <TrendingUp size={18} />
              </div>
              <p>Monthly Expenses</p>
              <h3>{formatInr(totals.expense || 175000)}</h3>
              <span className="chip red">{expenseToSalaryRatio}% of salary</span>
            </div>
            <div className="metric-right">
              <div className="gauge-indicator">
                <div className="gauge-bg"></div>
                <div className="gauge-fill" style={{width: `${expenseToSalaryRatio}%`}}></div>
              </div>
              <p className="metric-label">Budget usage</p>
              <span className="trend negative">+3.2% MoM</span>
            </div>
          </div>
        </article>
      </div>

      <div className="cards split dashboard-graphs">
        <article className="card chart-card cashflow-card">
          <div className="card-head">
            <div>
              <h3>Cash Flow Trend</h3>
              <p>
                Salary credited vs monthly spending ({cashFlowRange === '3m' ? 'last 3 months' : 'last 6 months'})
              </p>
            </div>
            <div className="segmented compact">
              <button
                className={cashFlowRange === '3m' ? 'active' : ''}
                onClick={() => setCashFlowRange('3m')}
              >
                3M
              </button>
              <button
                className={cashFlowRange === '6m' ? 'active' : ''}
                onClick={() => setCashFlowRange('6m')}
              >
                6M
              </button>
            </div>
          </div>
          <div className="cashflow-legend">
            <span><i className="dot-income" /> Salary Credit</span>
            <span><i className="dot-expense" /> Monthly Spend</span>
            <span><i className="dot mint" /> Net Savings shown below each month</span>
          </div>
          <div className="cashflow-kpi-row">
            <div className="cashflow-pill">
              <p>Avg Income</p>
              <strong>{formatInr(avgCashIncome)}</strong>
            </div>
            <div className="cashflow-pill">
              <p>Avg Spend</p>
              <strong>{formatInr(avgCashSpend)}</strong>
            </div>
            <div className="cashflow-pill positive">
              <p>Avg Savings</p>
              <strong>{formatInr(avgCashSavings)}</strong>
            </div>
          </div>
          <div className="cashflow-viz">
            {activeCashFlowSeries.map((row) => (
              <div key={row.month} className="cash-col">
                <div className="cash-bars">
                  <div className="cash-stick-slot">
                    <span
                      className="income-stick"
                      style={{ height: `${(row.income / cashFlowChartMax) * 190}px` }}
                    />
                    <div className="cash-tooltip-card">
                      <p>{row.month} Salary Credit</p>
                      <strong>{formatInr(row.income)}</strong>
                      <small>Net Savings: {formatInr(row.income - row.spend)}</small>
                    </div>
                  </div>
                  <div className="cash-stick-slot">
                    <span
                      className="spend-stick"
                      style={{ height: `${(row.spend / cashFlowChartMax) * 190}px` }}
                    />
                    <div className="cash-tooltip-card">
                      <p>{row.month} Monthly Spend</p>
                      <strong>{formatInr(row.spend)}</strong>
                      <small>Net Savings: {formatInr(row.income - row.spend)}</small>
                    </div>
                  </div>
                </div>
                <p className="cash-month">{row.month}</p>
                <p className="cash-net">Net: {formatInr(row.income - row.spend)}</p>
              </div>
            ))}
          </div>
          <div className="cashflow-footer">
            <span>
              Best month: <b>{bestCashMonth.month}</b>
            </span>
            <span>
              Income-to-spend ratio: <b>{avgCashSpend > 0 ? Math.round((avgCashIncome / avgCashSpend) * 100) : 0}%</b>
            </span>
            <span>
              Target savings next month: <b>{formatInr(avgCashSavings + 10000)}</b>
            </span>
          </div>
        </article>
        <article className="card donut-card expenseflow-card">
          <div className="card-head">
            <div>
              <h3>Expense Flow</h3>
              <p>Where your salary goes each month</p>
            </div>
            <span className="chip">Indian Spend Mix (% of salary)</span>
          </div>
          <div className="expense-donut-wrap">
            <div className="donut donut-modern" style={{ background: expenseDonutGradient }}>
              <div className="donut-center">
                <strong>{spentPct}%</strong>
                <span>SPENT OF SALARY</span>
              </div>
            </div>
            <div className="expense-note">
              <p>Remaining to save</p>
              <h4>{formatInr(remainingToSave)}</h4>
              <span className="chip green">Discipline Score: {disciplineScore}</span>
            </div>
          </div>
          <p className="legend-caption muted">
            Colored slices show expense categories as a share of salary. The grey slice is unspent income.
          </p>
          <ul className="legend">
            {expenseLegend.map((item) => (
              <li key={item.label}>
                <span className={`dot ${item.tone}`} />
                {item.label}
                <small>{formatInr(item.amount)}</small>
                <b>{item.pctSalary}%</b>
              </li>
            ))}
          </ul>
          <div className="expense-progress-list">
            {expenseLegend.map((item) => (
              <div key={item.label} className="expense-progress-item">
                <div className="expense-progress-head">
                  <span>{item.label}</span>
                  <b>{item.pctSalary}%</b>
                </div>
                <div className="expense-progress-track">
                  <span
                    className={`expense-progress-fill ${item.tone}`}
                    style={{ width: `${item.pctSalary}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="insight-strip">
        <div className="strip-icon">
          <TrendingUp size={17} />
        </div>
        <p>
          Your spending in <b>Travel</b> is <b className="green">15% lower</b> than last month.
          Move this surplus to your emergency fund or SIP to improve savings discipline.
        </p>
        <button
          className="ghost"
          onClick={() => {
            setActiveTab('insights')
            setFeedback('Opened full insights analysis.')
          }}
        >
          Full Analysis
        </button>
      </article>

      <article className="card dashboard-table-card">
        <div className="card-head">
          <div>
            <h3>Recent Transactions</h3>
            <p>Latest 3 entries from your salary ledger</p>
          </div>
          <button
            className="secondary"
            onClick={() => {
              setActiveTab('transactions')
              setFeedback('Opened full transactions table.')
            }}
          >
            See More {remainingRowsCount > 0 ? `(${remainingRowsCount})` : ''}
          </button>
        </div>
        <div className="table-wrap compact">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardPreviewRows.map((tx) => {
                const visual = getCategoryVisual(tx.category)
                const Icon = visual.icon
                return (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>
                      <div className="tx-description">
                        <span className={`tx-icon ${visual.tone}`}>
                          <Icon size={14} />
                        </span>
                        <div>
                          <strong>{tx.description}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{tx.category}</td>
                    <td className={tx.type === 'income' ? 'green' : 'red'}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatInr(tx.amount)}
                    </td>
                    <td>{tx.status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )

  const renderDesktopTransactions = () => (
    <section className="tab-panel">
      <div className="summary-row">
        <div>
          <h2>Transactions</h2>
          <p className="muted">{filtered.length} total movements detected this month</p>
        </div>
        <div className="inline-actions">
          <div
            className="export-wrap"
            onMouseEnter={() => setShowExportMenu(true)}
            onMouseLeave={() => setShowExportMenu(false)}
          >
            <button className="secondary">
              Export <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => exportData('csv')}>Download CSV</button>
                <button onClick={() => exportData('json')}>Download JSON</button>
                <button onClick={() => exportData('txt')}>Download TXT</button>
              </div>
            )}
          </div>
          {isAdmin && (
            <button className="cta" onClick={() => setShowAdd(true)}>
              + Add Transaction
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <label>
          Category
          <div
            className="filter-dropdown"
            tabIndex={0}
            onBlur={() => setOpenFilter((prev) => (prev === 'category' ? null : prev))}
          >
            <button
              className="filter-trigger"
              onClick={() => setOpenFilter((prev) => (prev === 'category' ? null : 'category'))}
            >
              {selectedCategoryLabel}
            </button>
            {openFilter === 'category' && (
              <div className="filter-menu">
                {allCategories.map((item) => (
                  <button
                    key={item}
                    className={category === item ? 'active' : ''}
                    onMouseDown={() => {
                      setCategory(item as Category | 'All')
                      setOpenFilter(null)
                    }}
                  >
                    {item === 'All' ? 'All Categories' : item}
                  </button>
                ))}
              </div>
            )}
            <ChevronDown size={14} />
          </div>
        </label>
        <label>
          Type
          <div
            className="filter-dropdown"
            tabIndex={0}
            onBlur={() => setOpenFilter((prev) => (prev === 'kind' ? null : prev))}
          >
            <button
              className="filter-trigger"
              onClick={() => setOpenFilter((prev) => (prev === 'kind' ? null : 'kind'))}
            >
              {selectedKindLabel}
            </button>
            {openFilter === 'kind' && (
              <div className="filter-menu">
                {[
                  { key: 'all', label: 'All Types' },
                  { key: 'income', label: 'Income Only' },
                  { key: 'expense', label: 'Expense Only' },
                ].map((option) => (
                  <button
                    key={option.key}
                    className={kind === option.key ? 'active' : ''}
                    onMouseDown={() => {
                      setKind(option.key as 'all' | TransactionType)
                      setOpenFilter(null)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            <ChevronDown size={14} />
          </div>
        </label>
        <label>
          Date Range
          <div
            className="filter-dropdown"
            tabIndex={0}
            onBlur={() => setOpenFilter((prev) => (prev === 'range' ? null : prev))}
          >
            <button
              className="filter-trigger"
              onClick={() => setOpenFilter((prev) => (prev === 'range' ? null : 'range'))}
            >
              {selectedRangeLabel}
            </button>
            {openFilter === 'range' && (
              <div className="filter-menu">
                {[
                  { key: '30d', label: 'Last 30 Days' },
                  { key: '90d', label: 'Last 90 Days' },
                  { key: '365d', label: 'Last 12 Months' },
                ].map((option) => (
                  <button
                    key={option.key}
                    className={range === option.key ? 'active' : ''}
                    onMouseDown={() => {
                      setRange(option.key as DateRange)
                      setOpenFilter(null)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            <ChevronDown size={14} />
          </div>
        </label>
        <button className="ghost" onClick={clearFilters}>
          <SlidersHorizontal size={14} />
          Clear Filters
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedFiltered.map((tx) => {
              const visual = getCategoryVisual(tx.category)
              const Icon = visual.icon
              return (
                <tr key={tx.id}>
                  <td>{formatDate(tx.date)}</td>
                  <td>
                    <div className="tx-description">
                      <span className={`tx-icon ${visual.tone}`}>
                        <Icon size={14} />
                      </span>
                      <div>
                        <strong>{tx.description}</strong>
                        <small>{tx.category} • {tx.type}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="chip">{tx.category}</span>
                  </td>
                  <td>
                    <span className={`chip ${tx.type === 'income' ? 'green' : 'red'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={tx.type === 'income' ? 'green' : 'red'}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatInr(tx.amount)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        value={tx.status}
                        onChange={(e) => updateTransactionStatus(tx.id, e.target.value as Transaction['status'])}
                      >
                        <option value="Settled">Settled</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                      </select>
                    ) : (
                      tx.status
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="ghost row-delete" onClick={() => deleteTransaction(tx.id)}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <p>
          Showing {(tablePage - 1) * tablePageSize + (filtered.length > 0 ? 1 : 0)}-
          {Math.min(tablePage * tablePageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="table-page-controls">
          <button
            className="secondary"
            onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
            disabled={tablePage === 1}
          >
            Previous
          </button>
          {Array.from({ length: tableTotalPages }).map((_, idx) => {
            const page = idx + 1
            return (
              <button
                key={page}
                className={`page-dot ${tablePage === page ? 'active' : ''}`}
                onClick={() => setTablePage(page)}
              >
                {page}
              </button>
            )
          })}
          <button
            className="secondary"
            onClick={() => setTablePage((prev) => Math.min(tableTotalPages, prev + 1))}
            disabled={tablePage === tableTotalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )

  const renderDesktopInsights = () => (
    <section className="tab-panel">
      <article className="hero-insight">
        <p className="muted label">SALARIED HEALTH SCORE</p>
        <div className="split-line">
          <h2>Savings Discipline</h2>
          <strong>44%</strong>
        </div>
        <p>
          Based on your current spend pattern, you are on track to save
          <b className="green"> {formatInr(135000)} </b>more this year from salary income.
        </p>
      </article>

      <div className="cards three insight-metric-row">
        <article className="card mini-metric">
          <div className="metric-icon metric-purple">
            <HandCoins size={16} />
          </div>
          <p>Highest Spending</p>
          <h3>Food & Dining</h3>
          <div className="row-end">
            <strong>{formatInr(850)}</strong>
            <span className="chip red">+12% vs last month</span>
          </div>
        </article>
        <article className="card mini-metric">
          <div className="metric-icon metric-cyan">
            <PiggyBank size={16} />
          </div>
          <p>Savings Rate</p>
          <h3>Wealth Accrual</h3>
          <div className="row-end">
            <strong>45%</strong>
            <span className="chip green">On Target</span>
          </div>
        </article>
        <article className="card mini-metric">
          <div className="metric-icon metric-rose">
            <Flame size={16} />
          </div>
          <p>Budget Alert</p>
          <h3>Rent & Housing</h3>
          <div className="row-end">
            <span className="muted">90% consumed</span>
            <span className="chip red">Critical</span>
          </div>
        </article>
      </div>

      <div className="cards split">
        <article className="card chart-card large-chart">
          <div className="card-head">
            <div>
              <h3>Income vs. Expenses</h3>
              <p>Quarterly performance & savings trend</p>
            </div>
            <div className="segmented compact">
              {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
                <button
                  key={q}
                  className={insightQuarter === q ? 'active' : ''}
                  onClick={() => setInsightQuarter(q)}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="insight-metrics">
            <div className="metric-pair">
              <div>
                <p className="metric-label">Total Income</p>
                <h4 className="metric-value green">{formatInr(insightIncomeTotal)}</h4>
              </div>
              <div>
                <p className="metric-label">Total Expense</p>
                <h4 className="metric-value red">{formatInr(insightExpenseTotal)}</h4>
              </div>
              <div>
                <p className="metric-label">Net Savings</p>
                <h4 className="metric-value primary">{formatInr(insightNetTotal)}</h4>
              </div>
            </div>
          </div>

          <div className="chart-zone">
            <div className="chart-grid" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="mini-bars">
              {insights.income.map((point, idx) => (
                <div key={point + idx} className="pair">
                  <div className="stick-slot">
                    <span style={{ height: `${point * 30}px` }} className="stick income" />
                    <div className="bar-tooltip-card">
                      <p>{insightMonths[idx]} Income</p>
                      <strong>{formatInr(point * 1000000)}</strong>
                    </div>
                  </div>
                  <div className="stick-slot">
                    <span style={{ height: `${insights.expense[idx] * 30}px` }} className="stick expense" />
                    <div className="bar-tooltip-card">
                      <p>{insightMonths[idx]} Expense</p>
                      <strong>{formatInr(insights.expense[idx] * 1000000)}</strong>
                    </div>
                  </div>
                  <small>{insightMonths[idx]}</small>
                </div>
              ))}
            </div>
            <div className="chart-footnote-row">
              <span>
                Best Month: <b>{insightMonths[bestMonthIndex]}</b>
              </span>
              <span>
                Net in {insightMonths[bestMonthIndex]}: <b>{formatInr((insights.income[bestMonthIndex] - insights.expense[bestMonthIndex]) * 1000000)}</b>
              </span>
            </div>
          </div>

          <div className="insight-legend">
            <span><i className="dot-income" /> Monthly Income</span>
            <span><i className="dot-expense" /> Monthly Expense</span>
            <span className="muted">Savings Average: <b>{formatInr(insightSavingsAvg)}</b></span>
          </div>
        </article>

        <article className="card growth-card enhanced-growth">
          <div className="growth-header">
            <div>
              <h3>Salary Allocation Snapshot</h3>
              <p className="muted">How monthly income is distributed</p>
            </div>
            <span className="chip green-glow">Spending in control</span>
          </div>
          
          <div className="growth-main">
            <h2 className="growth-value">{formatInr(monthlyTakeHome)}</h2>
            <p className="growth-desc">Expected month-end surplus</p>
            <div className="growth-trend">
              <span className="trend-up">↑ +8.2% vs previous month</span>
            </div>
          </div>

          <div className="growth-breakdown">
            <p className="breakdown-label">Salary Allocation</p>
            <div className="allocation-bars">
              <div className="allocation-item">
                <div className="bar-wrapper">
                  <span className="bar liquid" style={{ width: '62%' }} />
                </div>
                <div className="allocation-info">
                  <span className="alloc-name">Essentials (Rent, EMI, Bills)</span>
                  <span className="alloc-value">{formatInr(fixedCosts || 134500)}</span>
                </div>
              </div>
              <div className="allocation-item">
                <div className="bar-wrapper">
                  <span className="bar market" style={{ width: '38%' }} />
                </div>
                <div className="allocation-info">
                  <span className="alloc-name">Savings + Investments (SIP)</span>
                  <span className="alloc-value">{formatInr(monthlyTakeHome)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="growth-stats">
            <div className="stat-box">
              <span className="stat-label">Salary</span>
              <b className="stat-val">{formatInr(salaryIncome || 275000)}</b>
            </div>
            <div className="stat-box">
              <span className="stat-label">Obligations</span>
              <b className="stat-val">{formatInr(fixedCosts || 134500)}</b>
            </div>
            <div className="stat-box">
              <span className="stat-label">Invested (SIP)</span>
              <b className="stat-val green">{formatInr(35000)}</b>
            </div>
          </div>
        </article>
      </div>

      <article className="card goals-card">
        <div className="card-head">
          <div>
            <h3>Savings Goals</h3>
            <p>Create and track personal goals like vacation, phone, or gadgets.</p>
          </div>
          <span className={`chip ${isAdmin ? 'green' : ''}`}>{isAdmin ? 'Admin access' : 'Viewer mode'}</span>
        </div>
        {isAdmin ? (
          <form className="goals-form" onSubmit={onAddSavingsGoal}>
            <input
              value={goalDraft.title}
              onChange={(e) => setGoalDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Goal name (e.g. Ladakh trip, iPhone 17)"
              required
            />
            <input
              type="number"
              min={1}
              value={goalDraft.target || ''}
              onChange={(e) =>
                setGoalDraft((prev) => ({ ...prev, target: Number(e.target.value || 0) }))
              }
              placeholder="Target amount"
              required
            />
            <input
              type="number"
              min={0}
              value={goalDraft.saved || ''}
              onChange={(e) =>
                setGoalDraft((prev) => ({ ...prev, saved: Number(e.target.value || 0) }))
              }
              placeholder="Already saved"
            />
            <input
              type="date"
              value={goalDraft.deadline}
              onChange={(e) => setGoalDraft((prev) => ({ ...prev, deadline: e.target.value }))}
            />
            <button className="cta" type="submit">
              Add Goal
            </button>
          </form>
        ) : (
          <p className="muted">Switch to Admin Mode to create or update savings goals.</p>
        )}

        <div className="goals-list">
          {savingsGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.saved / Math.max(goal.target, 1)) * 100))
            return (
              <article key={goal.id} className="goal-item">
                <div className="goal-head">
                  <h4>{goal.title}</h4>
                  <span>{progress}%</span>
                </div>
                <p>
                  Saved {formatInr(goal.saved)} of {formatInr(goal.target)} · Deadline {formatDate(goal.deadline)}
                </p>
                <div className="goal-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      </article>
    </section>
  )

  const renderMobileDashboard = () => renderDesktopDashboard()

  const renderMobileInsights = () => renderDesktopInsights()

  const renderMobileTransactions = () => renderDesktopTransactions()

  return (
    <div className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`left-rail ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-block">
          <h1>{isSidebarCollapsed ? 'TL' : 'The Ledger'}</h1>
          {!isSidebarCollapsed && <p>SALARY EXPENSE MANAGER</p>}
          <button
            className="rail-collapse-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="rail-nav">
          {tabs.map((tab) => (
            (() => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  className={activeTab === tab.key ? 'active' : ''}
                  onClick={() => {
                    setActiveTab(tab.key)
                  }}
                >
                  <Icon size={16} />
                  {!isSidebarCollapsed && tab.label}
                </button>
              )
            })()
          ))}
        </nav>
        <div className="rail-bottom">
          <button onClick={() => setShowHelp(true)}>
            <HelpCircle size={15} /> {!isSidebarCollapsed && 'Help'}
          </button>
          <button
            onClick={() => {
              setFeedback('Signed out securely. This is a UI demo state.')
              setShowProfile(false)
            }}
          >
            <LogOut size={15} /> {!isSidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSearchMenu(true)}
              onBlur={() => setTimeout(() => setShowSearchMenu(false), 120)}
              placeholder="Search tabs, categories, transactions..."
              aria-label="Search"
            />
            {showSearchMenu && query.trim() && (
              <div className="search-dropdown">
                {searchResults.tabMatches.length > 0 && (
                  <div className="search-group">
                    <p>Tabs</p>
                    {searchResults.tabMatches.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={`tab-${tab.key}`}
                          onMouseDown={() => {
                            setActiveTab(tab.key)
                            setShowSearchMenu(false)
                          }}
                        >
                          <Icon size={14} /> {tab.label}
                        </button>
                      )
                    })}
                  </div>
                )}
                {searchResults.txMatches.length > 0 && (
                  <div className="search-group">
                    <p>Transactions</p>
                    {searchResults.txMatches.map((tx) => (
                      <button key={`tx-${tx.id}`} onMouseDown={() => onSearchSelectTransaction(tx)}>
                        <span>{tx.description}</span>
                        <small>{formatInr(tx.amount)}</small>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.tabMatches.length === 0 && searchResults.txMatches.length === 0 && (
                  <div className="search-empty">No matching tab or transaction found.</div>
                )}
              </div>
            )}
          </div>
          <div className="top-actions">
            <button
              className="icon-btn"
              onClick={() => {
                setShowNotifications((prev) => !prev)
                setNoticeCount(0)
              }}
              aria-label="Notifications"
            >
              <Bell size={15} />
              {noticeCount > 0 && <span className="badge">{noticeCount}</span>}
            </button>
            <button
              className="icon-btn"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label="Dark mode"
            >
              <Moon size={15} />
            </button>
            <button className="pill" onClick={() => setIsAdmin((prev) => !prev)}>
              {isAdmin ? 'Switch to Viewer' : 'Switch to Admin'}
            </button>
            <button className="avatar" onClick={() => setShowProfile((prev) => !prev)}>
              AK
            </button>
          </div>
        </header>

        {showNotifications && (
          <section className="notice-panel">
            <h3>Notifications</h3>
            <p>Salary credited today at 8:02 AM.</p>
            <p>EMI auto-pay is scheduled for tomorrow.</p>
          </section>
        )}

        {!isMobile && activeTab === 'dashboard' && renderDesktopDashboard()}
        {!isMobile && activeTab === 'transactions' && renderDesktopTransactions()}
        {!isMobile && activeTab === 'insights' && renderDesktopInsights()}

        {isMobile && activeTab === 'dashboard' && renderMobileDashboard()}
        {isMobile && activeTab === 'transactions' && renderMobileTransactions()}
        {isMobile && activeTab === 'insights' && renderMobileInsights()}

        {activeTab === 'settings' && (
          <section className="tab-panel settings-panel">
            <div className="settings-header">
              <h2>Profile Settings</h2>
              <p className="muted">Manage your account preferences and security options</p>
            </div>

            <div className="settings-grid">
              <article className="settings-card account-card">
                <div className="settings-card-header">
                  <div className="settings-icon user-icon">
                    <User size={24} />
                  </div>
                  <div>
                    <h3>Account Access</h3>
                    <p className="muted">Manage your account permissions</p>
                  </div>
                </div>
                <div className="settings-card-content">
                  <div className="mode-badge" style={{
                    background: isAdmin ? 'rgba(99, 102, 241, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    borderColor: isAdmin ? 'rgba(99, 102, 241, 0.3)' : 'rgba(107, 114, 128, 0.3)',
                  }}>
                    <span className="mode-label">Current Mode</span>
                    <strong>{isAdmin ? '👤 Admin' : '👁️ Viewer'}</strong>
                  </div>
                  {isAdmin && <p className="tip">📌 Full access to all features and settings</p>}
                  {!isAdmin && <p className="tip">📌 Read-only access (view-only mode)</p>}
                </div>
                <button className="pill" onClick={() => setIsAdmin((prev) => !prev)}>
                  Switch to {isAdmin ? 'Viewer' : 'Admin'} Mode
                </button>
              </article>

              <article className="settings-card theme-card">
                <div className="settings-card-header">
                  <div className="settings-icon theme-icon">
                    {isDark ? <Moon size={24} /> : <Sun size={24} />}
                  </div>
                  <div>
                    <h3>Visual Preferences</h3>
                    <p className="muted">Customize your interface</p>
                  </div>
                </div>
                <div className="settings-card-content">
                  <div className="theme-badge" style={{
                    background: isDark ? 'rgba(31, 41, 55, 0.15)' : 'rgba(255, 213, 79, 0.1)',
                    borderColor: isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 213, 79, 0.3)',
                  }}>
                    <span className="theme-label">Current Theme</span>
                    <strong>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</strong>
                  </div>
                  <p className="tip">💡 {isDark ? 'Easier on the eyes in low light' : 'Optimal for daytime usage'}</p>
                </div>
                <button className="pill" onClick={() => setIsDark((prev) => !prev)}>
                  Switch to {isDark ? 'Light' : 'Dark'} Mode
                </button>
              </article>
            </div>

            <article className="settings-card support-card">
              <div className="settings-card-header">
                <div className="settings-icon support-icon">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3>Support & Security</h3>
                  <p className="muted">Get help or manage your account security</p>
                </div>
              </div>
              <div className="settings-card-content">
                <p>Need assistance with salary budgeting, tax planning exports, or statement sync? Our support team is ready to help.</p>
              </div>
              <div className="settings-actions">
                <button className="secondary" onClick={() => setShowHelp(true)}>
                  <HelpCircle size={16} />
                  Open Help
                </button>
                <button
                  className="secondary"
                  onClick={() => setFeedback('Profile settings saved successfully.')}
                >
                  <CreditCard size={16} />
                  Save Profile
                </button>
                <button
                  className="ghost"
                  onClick={() => setFeedback('Signed out securely. This is a UI demo state.')}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </article>
          </section>
        )}

        <footer className="status-bar">
          <span>SYSTEM STATUS: OPERATIONAL</span>
          <span>LAST SYNC: 2M AGO</span>
        </footer>
      </main>

      <nav className="mobile-nav">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          <Wallet size={16} />
          <span>VAULT</span>
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => {
            setActiveTab('transactions')
          }}
        >
          <TrendingUp size={16} />
          <span>TRADE</span>
        </button>
        <button className={activeTab === 'insights' ? 'active' : ''} onClick={() => setActiveTab('insights')}>
          <Building2 size={16} />
          <span>INSIGHTS</span>
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          <Settings size={16} />
          <span>SETTINGS</span>
        </button>
      </nav>

      {isMobile && (
        isAdmin ? (
          <button className="floating-add" onClick={() => setShowAdd(true)}>
            +
          </button>
        ) : null
      )}

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal" onSubmit={onAddTransaction} onClick={(e) => e.stopPropagation()}>
            <h3>Add Transaction</h3>
            <label>
              Date
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <input
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. Fuel, Bonus, Mutual Fund SIP"
                required
              />
            </label>
            <label>
              Category
              <select
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value as Category }))}
              >
                {allCategories
                  .filter((item) => item !== 'All')
                  .map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, type: e.target.value as TransactionType }))
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label>
              Amount
              <input
                type="number"
                min={1}
                value={draft.amount || ''}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, amount: Number(e.target.value || 0) }))
                }
                required
              />
            </label>
            <div className="inline-actions">
              <button type="button" className="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button type="submit" className="cta">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Help Center</h3>
            <p>Use Dashboard for quick overview, Transactions for filtering/export, and Insights for trends.</p>
            <p>For a tax-ready report, use the Export button in Transactions tab.</p>
            <button className="cta" onClick={() => setShowHelp(false)}>
              Close
            </button>
          </section>
        </div>
      )}

      {showProfile && (
        <div className="profile-menu">
          <button onClick={() => setActiveTab('settings')}>Profile Settings</button>
          <button
            onClick={() => {
              setShowHelp(true)
              setShowProfile(false)
            }}
          >
            Help
          </button>
          <button
            onClick={() => {
              setFeedback('Signed out securely. This is a UI demo state.')
              setShowProfile(false)
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`toast ${activeTab !== 'transactions' ? 'subtle' : ''}`}
          role="status"
          onClick={() => setFeedback('')}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}

export default App
