import { useState, useEffect } from 'react';

function AddBook({ onAddBook, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publisher: '',
        publicationYear: '',
        language: '',
        pages: '',
        price: '',
        image: '',
        url: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                author: initialData.author || '',
                publisher: initialData.publisher || '',
                publicationYear: initialData.publicationYear || '',
                language: initialData.language || '',
                pages: initialData.pages || '',
                price: initialData.price || '',
                image: initialData.image || '',
                url: initialData.url || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newBook = {
            title: formData.title || '',
            author: formData.author || '',
            publisher: formData.publisher || '',
            publicationYear: formData.publicationYear || '',
            language: formData.language || '',
            pages: formData.pages || '',
            price: formData.price || '',
            image: formData.image || '',
            url: '#'
        };


        onAddBook(newBook);
        
        setFormData({
            title: '',
            author: '',
            publisher: '',
            publicationYear: '',
            language: '',
            pages: '',
            price: '',
            image: '',
            url: ''
        });
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-control">
                    <label htmlFor="title">Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Book Title..."
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="author">Author</label>
                    <input 
                        type="text" 
                        name="author" 
                        placeholder="Author"
                        value={formData.author}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="publisher">Publisher</label>
                    <input 
                        type="text" 
                        name="publisher" 
                        placeholder="Publisher"
                        value={formData.publisher}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="publicationYear">Publication Year</label>
                    <input 
                        type="number" 
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="language">Language</label>
                    <input 
                        type="text" 
                        name="language" 
                        placeholder="Language"
                        value={formData.language}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="pages">Pages</label>
                    <input 
                        type="number" 
                        name="pages"
                        value={formData.pages}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="image">URL (book cover)</label>
                    <input 
                        type="url" 
                        name="image" 
                        value={formData.image}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="btn primary">SAVE</button>
            </form>
        </div>
    );
}

export default AddBook;