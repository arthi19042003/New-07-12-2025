import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaChevronLeft, 
  FaChevronRight,
  FaCheck, // Icon for Approve
  FaTimes  // Icon for Reject
} from "react-icons/fa";
import "./PurchaseOrders.css";

const newPoInitialState = {
  poId: "",
  vendor: "",
  amount: "",
  date: new Date().toISOString().split("T")[0], 
};

const ITEMS_PER_PAGE = 5;

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [newPo, setNewPo] = useState(newPoInitialState);
  const [formError, setFormError] = useState('');

  // --- New State for Sort, Filter, Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get("/po");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Failed to load purchase orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateOrderStatus = async (id, newStatus) => {
    const originalOrders = [...orders];
    setOrders(
      orders.map((order) =>
        order._id === id ? { ...order, status: newStatus } : order
      )
    );
    setError('');
    try {
      await api.put(`/po/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error(`Error updating order ${id} status to ${newStatus}:`, err);
      setError(`Failed to update order ${id}. Please try again.`);
      setOrders(originalOrders);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPo(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!newPo.poId || !newPo.vendor || !newPo.amount || !newPo.date) {
      setFormError('All fields are required.');
      return;
    }
    
    try {
      const response = await api.post("/po", {
        ...newPo,
        poId: Number(newPo.poId),
        amount: Number(newPo.amount),
      });
      
      setOrders(prev => [response.data, ...prev]); 
      setNewPo(newPoInitialState); 
      setShowForm(false); 
    } catch (err) {
      console.error("Error creating PO:", err);
      setFormError(err.response?.data?.message || 'Failed to create PO.');
    }
  };

  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
       const parts = dateString.split('-');
       if (parts.length === 3) {
           const date = new Date(parts[0], parts[1] - 1, parts[2]);
           return date.toLocaleDateString("en-US", {
             year: 'numeric', month: 'short', day: 'numeric'
           });
       }
       return new Date(dateString).toLocaleDateString("en-US", {
         year: 'numeric', month: 'short', day: 'numeric'
       });
     } catch (e) {
       return 'Invalid Date';
     }
  };

  // --- Sort Handler ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Process Data (Filter -> Sort) ---
  const processedData = useMemo(() => {
    let data = [...orders];

    // 1. Filter
    if (statusFilter !== "All") {
      data = data.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.vendor && item.vendor.toLowerCase().includes(lowerTerm)) ||
        (item.poId && item.poId.toString().includes(lowerTerm))
      );
    }

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle number comparison
        if (sortConfig.key === 'amount' || sortConfig.key === 'poId') {
             aValue = Number(aValue);
             bValue = Number(bValue);
        } else {
             // String comparison
             aValue = (aValue || '').toString().toLowerCase();
             bValue = (bValue || '').toString().toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [orders, searchTerm, statusFilter, sortConfig]);

  // --- Pagination Logic ---
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="po-sort-icon faded" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="po-sort-icon" /> : <FaSortDown className="po-sort-icon" />;
  };

  return (
    <div className="po-container">
      <h2>Purchase Orders</h2>
      {error && !loading && <p className="po-error">{error}</p>}

      <div className="po-form-toggle">
        <button 
          className="po-btn-create"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '＋ Generate New PO'}
        </button>
      </div>

      {showForm && (
        <div className="po-card po-create-form">
          <h3>New Purchase Order</h3>
          <form onSubmit={handleCreateOrder}>
            <div className="po-form-grid">
              <div className="po-form-group">
                <label>PO ID *</label>
                <input type="number" name="poId" value={newPo.poId} onChange={handleFormChange} placeholder="e.g., 103" />
              </div>
              <div className="po-form-group">
                <label>Vendor *</label>
                <input type="text" name="vendor" value={newPo.vendor} onChange={handleFormChange} placeholder="Vendor Name" />
              </div>
              <div className="po-form-group">
                <label>Amount ($) *</label>
                <input type="number" name="amount" value={newPo.amount} onChange={handleFormChange} placeholder="e.g., 25000" />
              </div>
              <div className="po-form-group">
                <label>Date *</label>
                <input type="date" name="date" value={newPo.date} onChange={handleFormChange} />
              </div>
            </div>
            {formError && <p className="po-error-msg">{formError}</p>}
            <button type="submit" className="po-btn-create" style={{width: '100%', marginTop: '15px', padding: '12px'}}>Save Purchase Order</button>
          </form>
        </div>
      )}

      {/* --- Filters & Search Bar --- */}
      <div className="po-filters-container">
        <div className="po-search-box">
          <FaSearch className="po-search-icon" />
          <input 
            className="po-search-input"
            type="text" 
            placeholder="Search Vendor or PO ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="po-filter-box">
          <FaFilter className="po-filter-icon" />
          <select className="po-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="po-card">
        <h3>Existing Orders</h3>
        {loading ? (
           <p className="po-loading">Loading purchase orders...</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="po-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('poId')} className="po-clickable">
                      PO ID {getSortIcon('poId')}
                    </th>
                    <th onClick={() => handleSort('vendor')} className="po-clickable">
                      Vendor {getSortIcon('vendor')}
                    </th>
                    <th onClick={() => handleSort('amount')} className="po-clickable">
                      Amount ($) {getSortIcon('amount')}
                    </th>
                    <th onClick={() => handleSort('date')} className="po-clickable">
                      Date {getSortIcon('date')}
                    </th>
                    <th onClick={() => handleSort('status')} className="po-clickable">
                      Status {getSortIcon('status')}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                      <tr><td colSpan="6" className="po-empty">No purchase orders found.</td></tr>
                  ) : (
                      paginatedData.map((order) => (
                      <tr key={order._id}>
                          <td>{order.poId}</td>
                          <td>{order.vendor || 'N/A'}</td>
                          <td>{order.amount != null ? order.amount.toLocaleString() : 'N/A'}</td>
                          <td>{formatDate(order.date)}</td>
                          <td>
                          <span className={`po-status ${order.status?.toLowerCase() || 'pending'}`}>
                              {order.status || 'Pending'}
                          </span>
                          </td>
                          <td className="text-center">
                          {order.status === "Pending" ? (
                             <div className="d-flex justify-content-center gap-4 align-items-center">
                                {/* Approve Icon */}
                                <FaCheck
                                    className="po-icon-action po-icon-approve"
                                    title="Approve Order"
                                    onClick={() => updateOrderStatus(order._id, "Approved")}
                                />
                                {/* Reject Icon */}
                                <FaTimes
                                    className="po-icon-action po-icon-reject"
                                    title="Reject Order"
                                    onClick={() => updateOrderStatus(order._id, "Rejected")}
                                />
                             </div>
                          ) : (
                              <span className="po-no-action">—</span>
                          )}
                          </td>
                      </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Pagination Controls --- */}
            {totalItems > 0 && (
              <div className="po-pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="po-pagination-btn"
                >
                  <FaChevronLeft />
                </button>
                <span className="po-page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="po-pagination-btn"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;