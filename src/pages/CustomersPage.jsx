import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../AppContext';
import { uid } from '../utils';

import CustomerEditModal from '../components/CustomerEditModal';

function CustomersPage() {
  const { state, setState } = useContext(AppContext);

  // State for the form, search, and edit modal
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('الرجاء إدخال اسم العميل.');
      return;
    }
    const newCustomer = {
      id: uid('C'),
      name: name.trim(),
      phone: phone.trim(),
    };
    setState(prevState => ({
      ...prevState,
      customers: [...prevState.customers, newCustomer]
    }));
    setName('');
    setPhone('');
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setState(prevState => ({
        ...prevState,
        customers: prevState.customers.filter(c => c.id !== id)
      }));
    }
  };

  const handleSaveCustomer = (updatedCustomer) => {
    setState(prevState => ({
      ...prevState,
      customers: prevState.customers.map(c =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      )
    }));
    setEditingCustomer(null); // Close the modal
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) {
      return state.customers;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return state.customers.filter(c => {
      const searchable = `${c.name||''} ${c.phone||''}`.toLowerCase();
      return searchable.includes(lowerCaseQuery);
    });
  }, [state.customers, searchQuery]);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>إضافة عميل</h3>
        <form onSubmit={handleAddCustomer}>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم العميل"
            style={{marginBottom: '8px'}}
          />
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="الهاتف"
            style={{marginBottom: '8px'}}
          />
          <button className="btn" type="submit">حفظ</button>
        </form>
      </div>
      <div className="card">
        <h3>العملاء ({filteredCustomers.length})</h3>
        <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف..."
          style={{marginBottom: '8px'}}
        />
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>
                      <button className="btn" onClick={() => setEditingCustomer(c)} style={{marginLeft: '4px'}}>
                        تعديل
                      </button>
                      <button className="btn secondary" onClick={() => handleDeleteCustomer(c.id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">لا يوجد عملاء</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editingCustomer && (
        <CustomerEditModal
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </div>
  );
}

export default CustomersPage;
