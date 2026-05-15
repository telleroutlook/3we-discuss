import { Router, Route } from '@solidjs/router';
import { onMount } from 'solid-js';
import { fetchCurrentUser } from './src/stores/authStore';
import Layout from './src/views/Layout';
import Home from './src/views/Home';
import CategoryView from './src/views/CategoryView';
import PostDetail from './src/views/PostDetail';
import NewPost from './src/views/NewPost';
import UserProfile from './src/views/UserProfile';
import Search from './src/views/Search';
import Login from './src/views/Login';

export default function App() {
  onMount(() => {
    fetchCurrentUser();
  });

  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/c/:slug" component={CategoryView} />
      <Route path="/p/:id" component={PostDetail} />
      <Route path="/new" component={NewPost} />
      <Route path="/u/:username" component={UserProfile} />
      <Route path="/search" component={Search} />
      <Route path="/login" component={Login} />
    </Router>
  );
}
