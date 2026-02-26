import "./SideBar.css";
import KudiHerLogo from "../../assets/images/kudiHerLogo.svg?react";
import DashboardIcon from "../../assets/images/sideBarImages/dashboardIcon.svg?react";
import TransactionsIcon from "../../assets/images/sideBarImages/transactionIcon.svg?react";
import InventoryAiIcon from "../../assets/images/sideBarImages/inventoryAiIcon.svg?react";
import StockIcon from "../../assets/images/sideBarImages/stockIcon.svg?react";
import ReportsIcon from "../../assets/images/sideBarImages/reportsIcon.svg?react";
import CashFlowIcon from "../../assets/images/sideBarImages/cashFlowIcon.svg?react";
import ProfitabilityIcon from "../../assets/images/sideBarImages/profitabilityIcon.svg?react";
import SettingsIcon from "../../assets/images/sideBarImages/settingsIcon.svg?react";
import ProfileImageIcon from "../../assets/images/sideBarImages/profileImageIcon.svg?react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function SideBar() {
  const { user } = useAuth();

  return (
    <>
      <aside className="sideBar">
        <div className="sideBarLogo">
          <KudiHerLogo />
          <span>KudiHer</span>
        </div>
        <div className="sideBarNav">
          <nav className="sideBarNavListContainer">
            <ul>
              <li className="sideBarNavList">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <DashboardIcon className="sideBarNavListLinkSvg" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/transactions"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <TransactionsIcon className="sideBarNavListLinkSvg" />
                  <span>Transactions</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/inventoryai"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <InventoryAiIcon className="sideBarNavListLinkSvg" />
                  <span>Inventory AI</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/stock"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <StockIcon className="sideBarNavListLinkSvg" />
                  <span>Stock</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <ReportsIcon className="sideBarNavListLinkSvg" />
                  <span>Reports</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/cashflow"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <CashFlowIcon className="sideBarNavListLinkSvg" />
                  <span>Cash Flow</span>
                </NavLink>
              </li>
              <li className="sideBarNavList">
                <NavLink
                  to="/profitability"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <ProfitabilityIcon className="sideBarNavListLinkSvg" />
                  <span>Profitability</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <nav className="sideBarNavBottom">
            <ul>
              <li className="sideBarNavList settings">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    isActive
                      ? "sideBarNavListLink active"
                      : "sideBarNavListLink"
                  }
                >
                  <SettingsIcon className="sideBarNavListLinkSvg" />
                  <span>Settings</span>
                </NavLink>
              </li>
              <li className="sideBarProfile">
                <ProfileImageIcon className="sideBarProfileIcon" />
                <div className="sideBarProfileText">
                  <span className="sideBarProfileName">
                    {user?.businessName || "Business"}
                  </span>

                  <span className="sideBarProfileRole">
                    {user?.businessType || ""}
                  </span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
