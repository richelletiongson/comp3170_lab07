import './index.css'
import { useState } from 'react'

function LoanManagement({ onQuit, availableBooks, loans, onAddLoan, onReturnLoan }) {
  const [formData, setFormData] = useState({
    bookId: '',
    borrower: '',
    loanPeriod: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.bookId && formData.borrower && formData.loanPeriod) {
      onAddLoan(formData);
      setFormData({
        bookId: '',
        borrower: '',
        loanPeriod: ''
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="loan-management">
      <div className="loan-header-section">
        <h2>Manage Loans</h2>
        <button className="quit-button" onClick={onQuit}>
          QUIT
        </button>
      </div>

      <div className="loan-form-section">
        <div className="loan-form-container">
          {availableBooks.length === 0 ? (
            <p>There are no available books to borrow.</p>
          ) : (
            <form onSubmit={handleSubmit} className="loan-form">
              <div className="form-control">
                <label htmlFor="borrower">Borrower</label>
                <input
                  type="text"
                  id="borrower"
                  name="borrower"
                  placeholder="Borrower name..."
                  value={formData.borrower}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control">
                <label htmlFor="bookId">Book:</label>
                <select
                  id="bookId"
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a book</option>
                  {availableBooks.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label htmlFor="loanPeriod">Loan period: (in weeks)</label>
                <input
                  type="number"
                  id="loanPeriod"
                  name="loanPeriod"
                  min="1"
                  max="4"
                  value={formData.loanPeriod}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn primary">SUBMIT</button>
            </form>
          )}
        </div>
      </div>

      {loans.length > 0 && (
        <div className="loans-list-section">
          <h3>Currently on loan</h3>
          <div className="loans-list">
            {loans.map(loan => (
              <div key={loan.id} className="loan-item">
                <div className="loan-details">
                  <p><strong>Borrower:</strong> {loan.borrower}</p>
                  <p><strong>Book:</strong> {loan.bookTitle}</p>
                  <p><strong>Due date:</strong> {formatDate(loan.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanManagement;

