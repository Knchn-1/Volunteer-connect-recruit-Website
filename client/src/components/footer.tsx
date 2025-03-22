import React from "react";
import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">VolunteerConnect</h3>
            <p className="text-neutral-300">Connecting passionate volunteers with NGOs making a difference around the world.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Volunteers</h4>
            <ul className="space-y-2">
              <li><Link href="/volunteer/search"><a className="text-neutral-300 hover:text-white transition duration-200">Find Opportunities</a></Link></li>
              <li><Link href="/auth"><a className="text-neutral-300 hover:text-white transition duration-200">Create Profile</a></Link></li>
              <li><Link href="/volunteer/applications"><a className="text-neutral-300 hover:text-white transition duration-200">Track Applications</a></Link></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition duration-200">Resources</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Recruiters</h4>
            <ul className="space-y-2">
              <li><Link href="/recruiter/opportunities"><a className="text-neutral-300 hover:text-white transition duration-200">Post Opportunities</a></Link></li>
              <li><Link href="/auth"><a className="text-neutral-300 hover:text-white transition duration-200">NGO Registration</a></Link></li>
              <li><Link href="/recruiter/applications"><a className="text-neutral-300 hover:text-white transition duration-200">Manage Applications</a></Link></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition duration-200">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-neutral-300 hover:text-white transition duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition duration-200">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            <p className="text-neutral-300">Contact us: info@volunteerconnect.org</p>
          </div>
        </div>
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-300 text-sm">&copy; {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-300 hover:text-white transition duration-200 text-sm">Privacy Policy</a>
            <a href="#" className="text-neutral-300 hover:text-white transition duration-200 text-sm">Terms of Service</a>
            <a href="#" className="text-neutral-300 hover:text-white transition duration-200 text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
