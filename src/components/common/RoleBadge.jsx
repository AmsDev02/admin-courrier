// // src/components/common/RoleBadge.jsx
// import React from 'react';
// import { Tag, Tooltip } from 'antd';
// import { 
//   CrownOutlined, 
//   TeamOutlined, 
//   UserOutlined,
//   MailOutlined,
//   SecurityScanOutlined 
// } from '@ant-design/icons';

// const RoleBadge = ({ role, showIcon = true, showText = true, size = 'default' }) => {
//   const roleConfig = {
//     admin: {
//       color: 'red',
//       icon: <CrownOutlined />,
//       text: 'Administrateur',
//       description: 'Accès complet au système'
//     },
//     chef: {
//       color: 'orange',
//       icon: <TeamOutlined />,
//       text: 'Chef de Service',
//       description: 'Gestion d\'équipe et validation'
//     },
//     direction: {
//       color: 'purple',
//       icon: <SecurityScanOutlined />,
//       text: 'Direction',
//       description: 'Validation et supervision'
//     },
//     agent_courrier: {
//       color: 'blue',
//       icon: <MailOutlined />,
//       text: 'Agent Courrier',
//       description: 'Gestion courrier et distribution'
//     },
//     collaborateur: {
//       color: 'green',
//       icon: <UserOutlined />,
//       text: 'Collaborateur',
//       description: 'Utilisateur standard'
//     }
//   };

//   const config = roleConfig[role] || {
//     color: 'default',
//     icon: <UserOutlined />,
//     text: role,
//     description: 'Rôle utilisateur'
//   };

//   const tagSize = size === 'small' ? { fontSize: 11, padding: '2px 8px' } : {};

//   return (
//     <Tooltip title={config.description}>
//       <Tag 
//         color={config.color} 
//         style={{ 
//           ...tagSize,
//           border: 'none',
//           display: 'inline-flex',
//           alignItems: 'center',
//           gap: 4,
//           fontWeight: 600
//         }}
//       >
//         {showIcon && config.icon}
//         {showText && config.text}
//       </Tag>
//     </Tooltip>
//   );
// };

// export default RoleBadge;