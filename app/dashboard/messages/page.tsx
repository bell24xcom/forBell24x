'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  MessageCircle,
  Send,
  Search,
  Zap,
  Info,
} from 'lucide-react';

interface PlaceholderContact {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  time: string;
  unread: number;
  initials: string;
  avatarColor: string;
}

const PLACEHOLDER_CONTACTS: PlaceholderContact[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    company: 'Maharashtra Steel Industries',
    lastMessage: 'We can offer a 5% discount on bulk orders...',
    time: '2h ago',
    unread: 2,
    initials: 'PS',
    avatarColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    company: 'Delhi Electronics Hub',
    lastMessage: 'Our lead time for this quantity would be 14 days.',
    time: '1d ago',
    unread: 0,
    initials: 'RK',
    avatarColor: 'bg-green-100 text-green-700',
  },
  {
    id: '3',
    name: 'Anita Desai',
    company: 'Gujarat Textiles Ltd',
    lastMessage: 'Please find our revised quotation attached.',
    time: '3d ago',
    unread: 0,
    initials: 'AD',
    avatarColor: 'bg-amber-100 text-amber-700',
  },
];

function ContactListItem({
  contact,
  isSelected,
  onClick,
}: {
  contact: PlaceholderContact;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
        isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${contact.avatarColor}`}
      >
        {contact.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.time}</span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{contact.company}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{contact.lastMessage}</p>
      </div>
      {contact.unread > 0 && (
        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {contact.unread}
        </span>
      )}
    </button>
  );
}

export default function MessagesPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draftMessage, setDraftMessage] = useState('');

  const selectedContact = PLACEHOLDER_CONTACTS.find(c => c.id === selectedContactId) ?? null;

  const filteredContacts = PLACEHOLDER_CONTACTS.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">Messages</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-400 text-sm mt-1">Communicate with your suppliers</p>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium text-sm">
              Messaging between buyers and suppliers — launching soon
            </p>
            <p className="text-amber-400/80 text-xs mt-1">
              Real-time messaging is in active development. The interface below shows a preview of what&apos;s coming.
            </p>
          </div>
        </div>

        {/* Main Chat UI */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex" style={{ minHeight: '520px' }}>

          {/* Sidebar */}
          <aside className="w-full sm:w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredContacts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-400 text-sm">No contacts found</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <ContactListItem
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContactId === contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${selectedContact.avatarColor}`}
                  >
                    {selectedContact.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedContact.name}</p>
                    <p className="text-xs text-gray-500">{selectedContact.company}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    Preview mode
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-end gap-4">
                  {/* Placeholder messages */}
                  <div className="flex items-end gap-2 max-w-md">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${selectedContact.avatarColor}`}
                    >
                      {selectedContact.initials}
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                      <p className="text-sm text-gray-800">{selectedContact.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedContact.time}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2 max-w-md self-end">
                    <div className="bg-blue-600 rounded-2xl rounded-br-none px-4 py-3">
                      <p className="text-sm text-white">Thank you for the quote. Could you share more details?</p>
                      <p className="text-xs text-blue-200 mt-1">3d ago</p>
                    </div>
                  </div>

                  {/* Coming soon overlay on messages */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-amber-700 text-sm font-medium">Real-time messaging coming soon</p>
                    <p className="text-amber-600 text-xs mt-1">
                      For now, use the contact details from your quotes to reach suppliers directly.
                    </p>
                  </div>
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draftMessage}
                      onChange={e => setDraftMessage(e.target.value)}
                      placeholder="Type a message... (messaging not yet active)"
                      disabled
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <button
                      disabled
                      className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg opacity-40 cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-sm px-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold text-lg">No messages yet</h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Select a conversation from the sidebar, or wait for suppliers to reach out once messaging launches.
                    </p>
                  </div>
                  <Link
                    href="/rfq/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Post an RFQ to attract suppliers
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
