import { backend } from "declarations/backend";

let quill;
const postForm = document.getElementById('postForm');
const postsContainer = document.getElementById('posts');
const loadingIndicator = document.getElementById('loading');

// Initialize Quill editor
function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// Show/hide loading indicator
function toggleLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
}

// Format timestamp
function formatDate(timestamp) {
    const date = new Date(Number(timestamp) / 1000000); // Convert nano to milliseconds
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fetch and display posts
async function loadPosts() {
    try {
        toggleLoading(true);
        const posts = await backend.getPosts();
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">By ${post.author}</span>
                    <span class="date">${formatDate(post.timestamp)}</span>
                </div>
                <div class="post-content">${post.body}</div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        toggleLoading(false);
    }
}

// Initialize the app
function init() {
    initQuill();
    loadPosts();

    // New Post button handler
    document.getElementById('newPostBtn').addEventListener('click', () => {
        postForm.classList.remove('hidden');
    });

    // Cancel button handler
    document.getElementById('cancelPost').addEventListener('click', () => {
        postForm.classList.add('hidden');
        document.getElementById('postTitle').value = '';
        document.getElementById('authorName').value = '';
        quill.setText('');
    });

    // Submit post handler
    document.getElementById('submitPost').addEventListener('click', async () => {
        const title = document.getElementById('postTitle').value;
        const author = document.getElementById('authorName').value;
        const content = quill.root.innerHTML;

        if (!title || !author || !content) {
            alert('Please fill in all fields');
            return;
        }

        try {
            toggleLoading(true);
            await backend.createPost(title, content, author);
            postForm.classList.add('hidden');
            document.getElementById('postTitle').value = '';
            document.getElementById('authorName').value = '';
            quill.setText('');
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        } finally {
            toggleLoading(false);
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);
