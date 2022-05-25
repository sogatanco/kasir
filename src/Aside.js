import React from 'react';
import { useIntl } from 'react-intl';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FaTachometerAlt, FaGem, FaList,FaInstagram } from 'react-icons/fa';
import sidebarBg from './assets/bg2.jpg';

const Aside = ({ image, collapsed, rtl, toggled, handleToggleSidebar }) => {
  const intl = useIntl();
  return (
    <ProSidebar
      image={image ? sidebarBg : false}
      rtl={rtl}
      collapsed={collapsed}
      toggled={toggled}
      breakPoint="md"
      onToggle={handleToggleSidebar}
    >
      <SidebarHeader>
        <div
          style={{
            padding: '24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {intl.formatMessage({ id: 'sidebarTitle' })}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem icon={<FaTachometerAlt />}
            suffix={<span className="badge red">{intl.formatMessage({ id: 'new' })}</span>}
          >
            <a href="/" >  {intl.formatMessage({ id: 'dashboard' })}</a>
          </MenuItem>

          <MenuItem icon={<FaGem />} >
            <a href="/product" > {intl.formatMessage({ id: 'component1' })}</a>
          </MenuItem>

          <MenuItem  icon={<FaList />}> {intl.formatMessage({ id: 'component2' })}
          </MenuItem>
          
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center' }}>
        <div
          className="sidebar-btn-wrapper"
          style={{
            padding: '20px 24px',
          }}
        >
          <a
            href="https://instagram.com/_yudi.wahyu"
            target="_blank"
            className="sidebar-btn"
            rel="noopener noreferrer"
          >
            <FaInstagram />
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Developer
            </span>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default Aside;