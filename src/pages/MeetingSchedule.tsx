import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, Video, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, parse } from 'date-fns';

interface Invitation {
  email: string;
}

export function MeetingSchedule() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [invitations, setInvitations] = useState<Invitation[]>([{ email: '' }]);
  const [error, setError] = useState<string | null>(null);

  const handleAddInvitation = () => {
    setInvitations([...invitations, { email: '' }]);
  };

  const handleRemoveInvitation = (index: number) => {
    setInvitations(invitations.filter((_, i) => i !== index));
  };

  const handleInvitationChange = (index: number, email: string) => {
    const newInvitations = [...invitations];
    newInvitations[index].email = email;
    setInvitations(newInvitations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/signin');
        return;
      }

      const startTime = parse(
        `${date} ${time}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );

      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert([
          {
            title,
            description,
            host_id: user.id,
            start_time: startTime.toISOString(),
            duration: `${duration} hours`,
            room_id: crypto.randomUUID(),
            max_participants: parseInt(maxParticipants, 10),
          },
        ])
        .select()
        .single();

      if (meetingError) throw meetingError;

      const validInvitations = invitations.filter((inv) => inv.email.trim());
      if (validInvitations.length > 0) {
        const { error: invitationError } = await supabase
          .from('meeting_invitations')
          .insert(
            validInvitations.map((inv) => ({
              meeting_id: meeting.id,
              email: inv.email.trim(),
            }))
          );

        if (invitationError) throw invitationError;
      }

      navigate('/meetings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button
          onClick={() => navigate('/meetings')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="border-b dark:border-gray-700 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Schedule a Meeting
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Set up your virtual meeting room and invite participants.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  {/* Meeting Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Meeting Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g., Weekly Team Sync"
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Meeting agenda and details..."
                      className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Time
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration and Max Participants */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Duration
                      </label>
                      <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      >
                        {[0.5, 1, 1.5, 2, 2.5, 3].map((value) => (
                          <option key={value} value={value}>
                            {value} {value === 1 ? 'hour' : 'hours'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="maxParticipants"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Max Participants
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="maxParticipants"
                          value={maxParticipants}
                          onChange={(e) => setMaxParticipants(e.target.value)}
                          min="2"
                          max="50"
                          required
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invitations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invite Participants
                    </label>
                    <div className="space-y-3">
                      {invitations.map((invitation, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="email"
                            value={invitation.email}
                            onChange={(e) =>
                              handleInvitationChange(index, e.target.value)
                            }
                            placeholder="participant@example.com"
                            className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInvitation(index)}
                              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddInvitation}
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add another participant
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t dark:border-gray-700">
                  <button
                    type="submit"
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="mt-8 md:mt-0">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Meeting Features
                  </h2>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                    HD video and audio quality
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                    Screen sharing capabilities
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                    Chat and file sharing
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></span>
                    Recording options
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Tips
                  </h2>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Schedule meetings in advance for better attendance</li>
                  <li>• Include a clear agenda in the description</li>
                  <li>• Consider participants&apos; time zones</li>
                  <li>• Keep meetings focused and time-boxed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
