import './index.css'
import Book from './Book'
import Footer from './Footer'
import Header from './AppHeader'
import AddBook from './AddBook'
import Modal from './Modal'
import LoanManagement from './LoanManagement'
import { useState, useEffect } from 'react'

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [activeView, setActiveView] = useState('books'); // 'books' or 'loans'
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      const parsedBooks = JSON.parse(savedBooks);
      setBooks(parsedBooks);
      setFilteredBooks(parsedBooks);
    } else {

      setBooks([]);
      setFilteredBooks([]);
    }
    
    const savedLoans = localStorage.getItem('loans');
    if (savedLoans) {
      const parsedLoans = JSON.parse(savedLoans);
      setLoans(parsedLoans);
    } else {
      setLoans([]);
    }
    
    setIsInitialized(true);
  }, []);

  
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('books', JSON.stringify(books));
    }
  }, [books, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('loans', JSON.stringify(loans));
    }
  }, [loans, isInitialized]);


  useEffect(() => {
    if (selectedPublisher === 'All') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => book.publisher === selectedPublisher);
      setFilteredBooks(filtered);
    }
  }, [books, selectedPublisher]);


  const handleNewButtonClick = () => {
    setShowAddBook(!showAddBook);
  };

  const handleEditButtonClick = () => {
    const selectedBook = books.find(book => book.selected);
    if (selectedBook) {
      setEditingBook(selectedBook);
      setShowEditBook(true);
    }
  };

  const handleAddBook = (newBook) => {
    const bookWithId = {
      id: `book_${Date.now()}_${Math.random()}`,
      ...newBook,
      selected: false
    };
    setBooks(prev => [...prev, bookWithId]);
    setShowAddBook(false);
  };

  const handleEditBook = (updatedBook) => {
    setBooks(prev => prev.map(book => 
      book.id === editingBook.id ? { ...updatedBook, id: editingBook.id, selected: false } : book
    ));
    setShowEditBook(false);
    setEditingBook(null);
  };

  const handleBookSelect = (bookId) => {
    setBooks(prev => prev.map(book => ({
      ...book,
      selected: book.id === bookId ? !book.selected : false 
    })));
  };

  const handleDeleteBook = () => {
    setBooks(prev => prev.filter(book => !book.selected));
  };

  const handlePublisherFilter = (e) => {
    setSelectedPublisher(e.target.value);
  };

  // Get unique publishers for the dropdown
  const getUniquePublishers = () => {
    const publishers = books.map(book => book.publisher).filter(Boolean);
    return [...new Set(publishers)];
  };

  // Get available books (not currently on loan)
  const getAvailableBooks = () => {
    const loanedBookIds = loans.map(loan => loan.bookId);
    return books.filter(book => !loanedBookIds.includes(book.id));
  };

  const handleAddLoan = (loanData) => {
    // Calculate due date based on loan period (in weeks)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (parseInt(loanData.loanPeriod) * 7));
    
    const newLoan = {
      id: `loan_${Date.now()}_${Math.random()}`,
      bookId: loanData.bookId,
      borrower: loanData.borrower,
      loanPeriod: loanData.loanPeriod,
      dueDate: dueDate.toISOString().split('T')[0],
      bookTitle: books.find(book => book.id === loanData.bookId)?.title || ''
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const handleReturnLoan = (loanId) => {
    setLoans(prev => prev.filter(loan => loan.id !== loanId));
  };

  return (
    <div className="app">    
      <Header></Header>  
      <main className="main-content">
        {activeView === 'books' ? (
          <>
            <div className="books-header-section">
              <button 
                className="manage-loans-button"
                onClick={() => setActiveView('loans')}
              >
                MANAGE LOANS
              </button>
              <div className="filter-section">
                <label htmlFor="publisher-filter">filter by publisher:</label>
                <select 
                  id="publisher-filter"
                  value={selectedPublisher} 
                  onChange={handlePublisherFilter}
                  className="publisher-filter"
                >
                  <option value="All">All</option>
                  {getUniquePublishers().map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="content">
              <div className="new-button-column">
                <button className="new" onClick={handleNewButtonClick}>NEW</button>
                <button className="edit" onClick={handleEditButtonClick}>EDIT</button>
                <button className="delete" onClick={handleDeleteBook}>DELETE</button>
              </div>
              
              <div className="books-container">
                {filteredBooks.map((book) => {
                  const isOnLoan = loans.some(loan => loan.bookId === book.id);
                  return (
                    <Book 
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      publisher={book.publisher}
                      price={book.price}
                      image={book.image}
                      url={book.url}
                      selected={book.selected}
                      onSelect={handleBookSelect}
                      isOnLoan={isOnLoan}
                    />
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <LoanManagement 
            onQuit={() => setActiveView('books')}
            availableBooks={getAvailableBooks()}
            loans={loans}
            onAddLoan={handleAddLoan}
            onReturnLoan={handleReturnLoan}
          />
        )}
        
        <Modal 
          isOpen={showAddBook} 
          onClose={() => setShowAddBook(false)}
          title="Add Book"
        >
          <AddBook onAddBook={handleAddBook} />
        </Modal>
        
        <Modal 
          isOpen={showEditBook} 
          onClose={() => setShowEditBook(false)}
          title="Edit Book"
        >
          <AddBook onAddBook={handleEditBook} initialData={editingBook} />
        </Modal>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default App;
