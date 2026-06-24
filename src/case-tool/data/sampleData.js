export const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', type: 'deadline', message: 'Hospital Management System deadline in 7 days', timestamp: '2024-11-23T10:00:00', read: false, projectId: 'p2' },
  { id: 'n2', type: 'risk', message: 'New High priority risk added to Mobile Banking App', timestamp: '2024-11-20T14:30:00', read: false, projectId: 'p3' },
  { id: 'n3', type: 'estimation', message: 'E-Commerce Website — estimation v2 saved', timestamp: '2024-11-18T09:00:00', read: true, projectId: 'p1' },
  { id: 'n4', type: 'task', message: 'Bilal assigned you to Patient Registration module', timestamp: '2024-11-15T11:00:00', read: true, projectId: 'p2' },
  { id: 'n5', type: 'comment', message: 'Jethanand mentioned you in a comment on E-Commerce Website', timestamp: '2024-11-10T16:00:00', read: true, projectId: 'p1' },
]

export const SAMPLE_PROJECTS = [
  {
    id: 'p1',
    name: 'E-Commerce Website',
    domain: 'Web',
    description: 'A full-featured e-commerce platform with product catalog, cart, checkout, user authentication, and admin panel. Built to handle 50k+ concurrent users with real-time inventory management.',
    teamSize: 5,
    startDate: '2024-01-05',
    deadline: '2024-06-30',
    status: 'Completed',
    features: [
      { id: 'f1', name: 'Product Catalog', description: 'Browse and search products with filtering', priority: 'High', status: 'Done' },
      { id: 'f2', name: 'Shopping Cart', description: 'Add/remove items, manage quantities', priority: 'High', status: 'Done' },
      { id: 'f3', name: 'Checkout', description: 'Payment processing and order placement', priority: 'High', status: 'Done' },
      { id: 'f4', name: 'User Authentication', description: 'Login, register, password reset', priority: 'High', status: 'Done' },
      { id: 'f5', name: 'Order Tracking', description: 'Track order status and history', priority: 'Medium', status: 'Done' },
      { id: 'f6', name: 'Admin Panel', description: 'Manage products, orders, and users', priority: 'High', status: 'Done' },
      { id: 'f7', name: 'Search & Filters', description: 'Advanced product search and filtering', priority: 'Medium', status: 'Done' },
      { id: 'f8', name: 'Product Reviews', description: 'Rate and review products', priority: 'Low', status: 'Done' },
    ],
    team: [
      { id: 't1', name: 'Jethanand', role: 'project_manager', email: 'jethanand@example.com' },
      { id: 't2', name: 'Bilal Ahmed', role: 'team_member', email: 'bilal@example.com' },
      { id: 't3', name: 'Muquaddas Fatima', role: 'team_member', email: 'muquaddas@example.com' },
      { id: 't4', name: 'Sara Khan', role: 'team_member', email: 'sara@example.com' },
      { id: 't5', name: 'Usman Ali', role: 'team_member', email: 'usman@example.com' },
    ],
    estimations: [
      {
        id: 'e1', version: 'v1', technique: 'Fuzzy Logic', date: '2024-01-10',
        effort: '18 staff months', cost: '$90,000', duration: '6 months', status: 'Saved',
        effortNum: 18, costNum: 90000, durationNum: 6,
        data: {
          locPerCategory: { verySmall: 100, small: 300, medium: 600, large: 1200, veryLarge: 2400 },
          featureClassifications: { 'f1': 'large', 'f2': 'medium', 'f3': 'large', 'f4': 'medium', 'f5': 'small', 'f6': 'veryLarge', 'f7': 'medium', 'f8': 'small' },
          totalLOC: 7600,
        }
      },
      {
        id: 'e2', version: 'v2', technique: 'Expert Judgment', date: '2024-01-18',
        effort: '21 staff months', cost: '$105,000', duration: '7 months', status: 'Saved',
        effortNum: 21, costNum: 105000, durationNum: 7,
        data: {
          tasks: [
            { name: 'Product Catalog', best: 20, likely: 30, worst: 45, expected: 31.67 },
            { name: 'Shopping Cart', best: 10, likely: 15, worst: 25, expected: 15.83 },
            { name: 'Checkout & Payments', best: 30, likely: 45, worst: 70, expected: 46.67 },
            { name: 'User Auth', best: 10, likely: 15, worst: 20, expected: 15.0 },
            { name: 'Order Tracking', best: 8, likely: 12, worst: 18, expected: 12.33 },
            { name: 'Admin Panel', best: 25, likely: 40, worst: 60, expected: 41.67 },
            { name: 'Search & Filters', best: 12, likely: 18, worst: 28, expected: 18.67 },
            { name: 'Reviews', best: 5, likely: 8, worst: 12, expected: 8.17 },
          ],
          totalExpected: 190, sd: 14.2,
        }
      }
    ],
    risks: [
      { id: 'r1', description: 'Payment gateway integration failure', category: 'Technology', probability: 40, impact: 5, costImpact: 15000, riskExposure: 6000, priority: 'High', status: 'Resolved', mitigation: 'Use well-documented API with sandbox testing', monitoring: 'Weekly integration tests', management: 'Have backup payment provider ready' },
      { id: 'r2', description: 'Team member attrition during critical phase', category: 'Staff/People', probability: 25, impact: 4, costImpact: 20000, riskExposure: 5000, priority: 'High', status: 'Resolved', mitigation: 'Knowledge documentation and pair programming', monitoring: 'Monthly team satisfaction surveys', management: 'Cross-train all team members' },
      { id: 'r3', description: 'Third-party API rate limits exceeded', category: 'Technology', probability: 50, impact: 2, costImpact: 5000, riskExposure: 2500, priority: 'Medium', status: 'Resolved', mitigation: 'Implement caching layer', monitoring: 'Monitor API usage daily', management: 'Negotiate higher rate limits' },
      { id: 'r4', description: 'Scope creep from stakeholder requests', category: 'Business Impact', probability: 60, impact: 3, costImpact: 10000, riskExposure: 6000, priority: 'Medium', status: 'Resolved', mitigation: 'Strict change control process', monitoring: 'Weekly scope review meetings', management: 'Formal change request forms' },
    ],
    comments: [
      { id: 'c1', author: 'Jethanand', text: 'Project completed on time. Great team effort!', timestamp: '2024-06-30T10:00:00', replies: [] },
      { id: 'c2', author: 'Bilal Ahmed', text: 'Checkout module was the most challenging part but we nailed it.', timestamp: '2024-06-28T14:30:00', replies: [] },
    ],
    activityLog: [
      { id: 'a1', user: 'Jethanand', action: 'saved Estimation v2 (Expert Judgment)', timestamp: '2024-01-18T15:00:00' },
      { id: 'a2', user: 'Bilal Ahmed', action: 'updated Risk #1 status to Resolved', timestamp: '2024-06-20T11:00:00' },
      { id: 'a3', user: 'Muquaddas Fatima', action: 'added 2 new features', timestamp: '2024-01-08T09:00:00' },
    ],
    tasks: [
      { id: 'task1', name: 'Deploy to production', assignee: 'Usman Ali', priority: 'High', dueDate: '2024-06-29', status: 'Done', feature: 'Checkout', description: 'Final production deployment and smoke tests' },
      { id: 'task2', name: 'Performance testing', assignee: 'Sara Khan', priority: 'Medium', dueDate: '2024-06-25', status: 'Done', feature: 'Product Catalog', description: 'Load testing with 50k concurrent users' },
      { id: 'task3', name: 'Security audit', assignee: 'Bilal Ahmed', priority: 'High', dueDate: '2024-06-15', status: 'Done', feature: 'User Authentication', description: 'OWASP top 10 security checks' },
    ],
  },
  {
    id: 'p2',
    name: 'Hospital Management System',
    domain: 'Web',
    description: 'Comprehensive hospital management system covering patient registration, appointments, billing, pharmacy, and reporting. Designed for a 500-bed hospital with 200+ daily patient interactions.',
    teamSize: 7,
    startDate: '2024-03-01',
    deadline: '2024-11-30',
    status: 'Active',
    features: [
      { id: 'f1', name: 'Patient Registration', description: 'Register and manage patient records', priority: 'High', status: 'Done' },
      { id: 'f2', name: 'Appointments', description: 'Schedule and manage appointments', priority: 'High', status: 'In Progress' },
      { id: 'f3', name: 'Doctor Schedule', description: 'Manage doctor availability and shifts', priority: 'High', status: 'In Progress' },
      { id: 'f4', name: 'Lab Results', description: 'Upload and view lab test results', priority: 'Medium', status: 'To Do' },
      { id: 'f5', name: 'Billing', description: 'Generate and manage patient bills', priority: 'High', status: 'To Do' },
      { id: 'f6', name: 'Pharmacy', description: 'Medication dispensing and inventory', priority: 'Medium', status: 'To Do' },
      { id: 'f7', name: 'Ward Management', description: 'Bed allocation and ward overview', priority: 'Medium', status: 'To Do' },
      { id: 'f8', name: 'Reports', description: 'Clinical and administrative reports', priority: 'Low', status: 'To Do' },
      { id: 'f9', name: 'Staff Management', description: 'HR and staff records management', priority: 'Medium', status: 'To Do' },
      { id: 'f10', name: 'Notifications', description: 'Alerts and reminders for staff', priority: 'Low', status: 'To Do' },
      { id: 'f11', name: 'Audit Log', description: 'Track all system actions', priority: 'Medium', status: 'To Do' },
      { id: 'f12', name: 'Role Management', description: 'User roles and permissions', priority: 'High', status: 'Done' },
    ],
    team: [
      { id: 't1', name: 'Jethanand', role: 'project_manager', email: 'jethanand@example.com' },
      { id: 't2', name: 'Bilal Ahmed', role: 'team_member', email: 'bilal@example.com' },
      { id: 't3', name: 'Muquaddas Fatima', role: 'team_member', email: 'muquaddas@example.com' },
      { id: 't4', name: 'Sara Khan', role: 'team_member', email: 'sara@example.com' },
      { id: 't5', name: 'Usman Ali', role: 'team_member', email: 'usman@example.com' },
      { id: 't6', name: 'Ahmed Raza', role: 'team_member', email: 'ahmed@example.com' },
      { id: 't7', name: 'Fatima Malik', role: 'team_member', email: 'fatima@example.com' },
    ],
    estimations: [
      {
        id: 'e1', version: 'v1', technique: 'Decomposition + SD', date: '2024-03-10',
        effort: '28 staff months', cost: '$140,000', duration: '9 months', status: 'Saved',
        effortNum: 28, costNum: 140000, durationNum: 9,
        data: {
          tasks: [
            { name: 'Patient Registration', best: 25, worst: 45 },
            { name: 'Appointments Module', best: 20, worst: 40 },
            { name: 'Doctor Schedule', best: 15, worst: 30 },
            { name: 'Lab Results', best: 20, worst: 35 },
            { name: 'Billing', best: 30, worst: 55 },
            { name: 'Pharmacy', best: 25, worst: 45 },
            { name: 'Ward Management', best: 20, worst: 38 },
            { name: 'Reports', best: 15, worst: 30 },
            { name: 'Staff Management', best: 18, worst: 33 },
            { name: 'Notifications', best: 10, worst: 20 },
          ],
          sumBest: 198, sumWorst: 371, sd: 28.83, confidence50Low: 256, confidence50High: 314,
        }
      },
      {
        id: 'e2', version: 'v2', technique: 'Story Points', date: '2024-03-18',
        effort: '30 staff months', cost: '$150,000', duration: '9 months', status: 'Saved',
        effortNum: 30, costNum: 150000, durationNum: 9,
        data: {
          velocity: 25, totalBacklogSP: 210, iterationLength: 2,
          iterationsNeeded: 9, totalWeeks: 18,
          features: [
            { name: 'Patient Registration', size: 'L', businessValue: 9, recommendation: 'Include' },
            { name: 'Appointments', size: 'L', businessValue: 9, recommendation: 'Include' },
            { name: 'Doctor Schedule', size: 'M', businessValue: 8, recommendation: 'Include' },
            { name: 'Lab Results', size: 'M', businessValue: 7, recommendation: 'Include' },
            { name: 'Billing', size: 'XL', businessValue: 9, recommendation: 'Include' },
            { name: 'Pharmacy', size: 'L', businessValue: 8, recommendation: 'Include' },
            { name: 'Ward Management', size: 'M', businessValue: 7, recommendation: 'Include' },
            { name: 'Reports', size: 'S', businessValue: 6, recommendation: 'Include' },
            { name: 'Staff Management', size: 'M', businessValue: 7, recommendation: 'Include' },
            { name: 'Notifications', size: 'S', businessValue: 5, recommendation: 'Consider dropping' },
            { name: 'Audit Log', size: 'S', businessValue: 6, recommendation: 'Include' },
            { name: 'Role Management', size: 'M', businessValue: 8, recommendation: 'Include' },
          ]
        }
      }
    ],
    risks: [
      { id: 'r1', description: 'HIPAA compliance requirements not fully understood', category: 'Business Impact', probability: 55, impact: 5, costImpact: 50000, riskExposure: 27500, priority: 'High', status: 'In Progress', mitigation: 'Hire compliance consultant', monitoring: 'Bi-weekly compliance audits', management: 'Dedicated compliance officer' },
      { id: 'r2', description: 'Integration with legacy hospital systems', category: 'Technology', probability: 65, impact: 5, costImpact: 30000, riskExposure: 19500, priority: 'High', status: 'Open', mitigation: 'Build API middleware layer', monitoring: 'Weekly integration testing', management: 'Fallback to manual data entry if needed' },
      { id: 'r3', description: 'Staff resistance to new system adoption', category: 'Customer', probability: 70, impact: 4, costImpact: 15000, riskExposure: 10500, priority: 'High', status: 'In Progress', mitigation: 'Comprehensive training program', monitoring: 'Monthly adoption metrics', management: 'Change management specialist' },
      { id: 'r4', description: 'Database performance with large patient records', category: 'Technology', probability: 40, impact: 4, costImpact: 20000, riskExposure: 8000, priority: 'Medium', status: 'Open', mitigation: 'Optimize queries and add indexing', monitoring: 'Performance benchmarks weekly', management: 'Database sharding if needed' },
      { id: 'r5', description: 'Unclear billing requirements from hospital', category: 'Customer', probability: 50, impact: 3, costImpact: 12000, riskExposure: 6000, priority: 'Medium', status: 'Open', mitigation: 'Detailed requirements workshops', monitoring: 'Weekly stakeholder meetings', management: 'Formal sign-off on requirements' },
      { id: 'r6', description: 'Budget overrun due to scope creep', category: 'Schedule', probability: 35, impact: 2, costImpact: 8000, riskExposure: 2800, priority: 'Low', status: 'Open', mitigation: 'Strict scope management', monitoring: 'Monthly budget reviews', management: 'Change request approval process' },
    ],
    comments: [
      { id: 'c1', author: 'Muquaddas Fatima', text: 'We need to prioritize billing module this sprint.', timestamp: '2024-11-15T09:00:00', replies: [] },
      { id: 'c2', author: 'Ahmed Raza', text: 'Legacy system integration is taking longer than expected. Need to escalate.', timestamp: '2024-11-10T14:00:00', replies: [] },
    ],
    activityLog: [
      { id: 'a1', user: 'Jethanand', action: 'saved Estimation v2 (Story Points)', timestamp: '2024-03-18T15:00:00' },
      { id: 'a2', user: 'Bilal Ahmed', action: 'updated Risk #2 status to In Progress', timestamp: '2024-11-12T11:00:00' },
      { id: 'a3', user: 'Fatima Malik', action: 'completed Patient Registration feature', timestamp: '2024-09-15T09:00:00' },
    ],
    tasks: [
      { id: 'task1', name: 'Complete patient registration UI', assignee: 'Bilal Ahmed', priority: 'High', dueDate: '2024-11-20', status: 'Done', feature: 'Patient Registration', description: 'Frontend forms and validation' },
      { id: 'task2', name: 'Doctor schedule API integration', assignee: 'Ahmed Raza', priority: 'High', dueDate: '2024-11-25', status: 'In Progress', feature: 'Doctor Schedule', description: 'REST API integration with scheduling service' },
      { id: 'task3', name: 'Billing module design', assignee: 'Muquaddas Fatima', priority: 'High', dueDate: '2024-11-28', status: 'To Do', feature: 'Billing', description: 'UI design and backend schema for billing' },
      { id: 'task4', name: 'Lab results upload flow', assignee: 'Sara Khan', priority: 'Medium', dueDate: '2024-11-30', status: 'To Do', feature: 'Lab Results', description: 'File upload and result display' },
    ],
  },
  {
    id: 'p3',
    name: 'Mobile Banking App',
    domain: 'Mobile',
    description: 'Secure mobile banking application with biometric login, fund transfers, bill payments, and real-time transaction history. PCI-DSS compliant with end-to-end encryption.',
    teamSize: 6,
    startDate: '2024-02-10',
    deadline: '2024-09-30',
    status: 'Completed',
    features: [
      { id: 'f1', name: 'Login / Biometric', description: 'Secure login with fingerprint and face ID', priority: 'High', status: 'Done' },
      { id: 'f2', name: 'Dashboard', description: 'Account overview and quick actions', priority: 'High', status: 'Done' },
      { id: 'f3', name: 'Fund Transfer', description: 'Transfer money to other accounts', priority: 'High', status: 'Done' },
      { id: 'f4', name: 'Bill Pay', description: 'Pay utility and telecom bills', priority: 'High', status: 'Done' },
      { id: 'f5', name: 'Transaction History', description: 'View and filter past transactions', priority: 'Medium', status: 'Done' },
      { id: 'f6', name: 'Notifications', description: 'Push notifications for transactions', priority: 'Medium', status: 'Done' },
      { id: 'f7', name: 'Card Management', description: 'Block/unblock cards, view limits', priority: 'Medium', status: 'Done' },
      { id: 'f8', name: 'Support Chat', description: 'In-app customer support', priority: 'Low', status: 'Done' },
      { id: 'f9', name: 'Settings', description: 'App preferences and security settings', priority: 'Low', status: 'Done' },
      { id: 'f10', name: 'Onboarding', description: 'New user registration and KYC', priority: 'High', status: 'Done' },
    ],
    team: [
      { id: 't1', name: 'Jethanand', role: 'project_manager', email: 'jethanand@example.com' },
      { id: 't2', name: 'Bilal Ahmed', role: 'team_member', email: 'bilal@example.com' },
      { id: 't3', name: 'Sara Khan', role: 'team_member', email: 'sara@example.com' },
      { id: 't4', name: 'Usman Ali', role: 'team_member', email: 'usman@example.com' },
      { id: 't5', name: 'Ahmed Raza', role: 'team_member', email: 'ahmed@example.com' },
      { id: 't6', name: 'Nadia Hussain', role: 'team_member', email: 'nadia@example.com' },
    ],
    estimations: [
      {
        id: 'e1', version: 'v1', technique: 'Analogy', date: '2024-02-15',
        effort: '20 staff months', cost: '$100,000', duration: '7 months', status: 'Saved',
        effortNum: 20, costNum: 100000, durationNum: 7,
        data: {
          analogyProject: 'E-Commerce Website',
          analogyLOC: 7600, analogyEffort: 18, analogyCost: 90000, analogyDuration: 6,
          newLOC: 8500, adjustmentFactor: 10,
          scaledEffort: 19.8, scaledCost: 99000, scaledDuration: 6.6,
          notes: 'Based on E-Commerce Website project. Banking app has similar complexity but adds biometric and security overhead (+10% adjustment).'
        }
      },
      {
        id: 'e2', version: 'v2', technique: 'T-Shirt Sizing', date: '2024-02-22',
        effort: '22 staff months', cost: '$110,000', duration: '7.5 months', status: 'Saved',
        effortNum: 22, costNum: 110000, durationNum: 7.5,
        data: {
          features: [
            { name: 'Login / Biometric', size: 'L', businessValue: 10, recommendation: 'Include' },
            { name: 'Dashboard', size: 'M', businessValue: 9, recommendation: 'Include' },
            { name: 'Fund Transfer', size: 'XL', businessValue: 10, recommendation: 'Include' },
            { name: 'Bill Pay', size: 'L', businessValue: 8, recommendation: 'Include' },
            { name: 'Transaction History', size: 'M', businessValue: 8, recommendation: 'Include' },
            { name: 'Notifications', size: 'S', businessValue: 7, recommendation: 'Include' },
            { name: 'Card Management', size: 'M', businessValue: 7, recommendation: 'Include' },
            { name: 'Support Chat', size: 'M', businessValue: 5, recommendation: 'Consider dropping' },
            { name: 'Settings', size: 'S', businessValue: 6, recommendation: 'Include' },
            { name: 'Onboarding', size: 'L', businessValue: 9, recommendation: 'Include' },
          ]
        }
      }
    ],
    risks: [
      { id: 'r1', description: 'Security vulnerabilities in biometric authentication', category: 'Technology', probability: 35, impact: 5, costImpact: 40000, riskExposure: 14000, priority: 'High', status: 'Resolved', mitigation: 'Third-party security audit', monitoring: 'Penetration testing monthly', management: 'Emergency security patch process' },
      { id: 'r2', description: 'Regulatory approval delays from central bank', category: 'Business Impact', probability: 45, impact: 5, costImpact: 30000, riskExposure: 13500, priority: 'High', status: 'Resolved', mitigation: 'Early engagement with regulators', monitoring: 'Track regulatory timeline', management: 'Legal team on standby' },
      { id: 'r3', description: 'App store rejection due to compliance issues', category: 'Process', probability: 30, impact: 4, costImpact: 10000, riskExposure: 3000, priority: 'Medium', status: 'Resolved', mitigation: 'Pre-submission review against guidelines', monitoring: 'Follow app store policy updates', management: 'Have alternative distribution ready' },
      { id: 'r4', description: 'Network latency affecting transaction processing', category: 'Technology', probability: 40, impact: 3, costImpact: 8000, riskExposure: 3200, priority: 'Medium', status: 'Resolved', mitigation: 'Implement offline-first architecture', monitoring: 'Performance monitoring in production', management: 'Fallback to SMS OTP if needed' },
      { id: 'r5', description: 'Low user adoption due to UX complexity', category: 'Customer', probability: 25, impact: 2, costImpact: 5000, riskExposure: 1250, priority: 'Low', status: 'Resolved', mitigation: 'Usability testing with real users', monitoring: 'App store ratings and reviews', management: 'UX improvement sprints post-launch' },
    ],
    comments: [
      { id: 'c1', author: 'Jethanand', text: 'Project delivered 2 weeks ahead of schedule! Excellent work everyone.', timestamp: '2024-09-15T10:00:00', replies: [] },
      { id: 'c2', author: 'Nadia Hussain', text: 'Biometric integration was complex but the third-party audit really helped.', timestamp: '2024-09-12T16:00:00', replies: [] },
    ],
    activityLog: [
      { id: 'a1', user: 'Jethanand', action: 'saved Estimation v2 (T-Shirt Sizing)', timestamp: '2024-02-22T15:00:00' },
      { id: 'a2', user: 'Usman Ali', action: 'updated Risk #1 status to Resolved', timestamp: '2024-09-10T11:00:00' },
      { id: 'a3', user: 'Ahmed Raza', action: 'completed App store submission', timestamp: '2024-09-20T09:00:00' },
    ],
    tasks: [
      { id: 'task1', name: 'Security audit', assignee: 'Usman Ali', priority: 'High', dueDate: '2024-09-10', status: 'Done', feature: 'Login / Biometric', description: 'Full penetration testing and OWASP audit' },
      { id: 'task2', name: 'App store submission', assignee: 'Ahmed Raza', priority: 'High', dueDate: '2024-09-20', status: 'Done', feature: 'Onboarding', description: 'Submit to App Store and Google Play' },
      { id: 'task3', name: 'Performance benchmarking', assignee: 'Sara Khan', priority: 'Medium', dueDate: '2024-09-08', status: 'Done', feature: 'Fund Transfer', description: 'Load testing transaction throughput' },
    ],
  }
]
