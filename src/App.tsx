import { Switch, Route } from 'wouter';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminPageBuilder from './pages/AdminPageBuilder';
import Coimbatore from './pages/Coimbatore';
import Kolkata from './pages/Kolkata';
import Hyderabad from './pages/Hyderabad';
import LocationPage from './pages/LocationPage';
import NotFound from './pages/not-found';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/builder/:id" component={AdminPageBuilder} />
      <Route path="/coimbatore" component={Coimbatore} />
      <Route path="/kolkata" component={Kolkata} />
      <Route path="/hyderabad" component={Hyderabad} />
      <Route path="/:slug" component={LocationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}
