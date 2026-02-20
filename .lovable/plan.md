# Hybrid Barbershop Queue System — Implementation Plan

## Overview

A mobile-first (portrait 9:16) real-time barbershop queue management system with a dark, modern barbershop aesthetic. Two interfaces: Customer page and Admin page, powered by Supabase Realtime.

---

## 1. Database Setup (Supabase)

### Table: `queues`

- `id` (uuid, PK), `customer_name` (text), `queue_number` (int8, auto-incrementing), `type` ('Online' | 'Manual' | 'FastTrack'), `status` ('Waiting' | 'Calling' | 'Processing' | 'Done'), `is_notified` (boolean, default false), `created_at` (timestamptz)
- Queue numbers keep incrementing (never reset)

### Table: `settings`

- Store admin PIN here so it can be changed without code edits

### RLS Policies

- Public read access on `queues` for the customer page
- Insert access for new queue entries (no auth required)
- Update/delete restricted or open (admin actions via PIN check, not Supabase Auth)

### Realtime

- Enable Realtime on the `queues` table for instant updates

---

## 2. Customer Page (`/`)

### Now Serving Display

- Large, prominent display showing the current queue number being processed (status: 'Processing')
- "Next Queue" showing the next waiting number (respecting FastTrack priority)

### "Ambil Antrean" (Take a Number)

- Simple form: Name input only
- On submit: inserts a new row with type 'Online', status 'Waiting'
- Redirects to `/?ticket={uuid}` showing the virtual ticket

### Virtual Ticket View

- Shows the customer's queue number prominently
- Real-time status card (Waiting → Calling → Processing → Done)
- When `is_notified` becomes `true`: play a bell/ting sound and show a full-screen "Silakan Masuk!" overlay

### Real-time Updates

- Supabase Realtime subscription on the `queues` table
- Now Serving and Next Queue update instantly without page refresh

---

## 3. Admin Page (`/admin`)

### PIN Protection

- PIN entry screen on first visit
- PIN stored in `settings` table in Supabase
- Session persisted in localStorage after successful entry

### Active Queue List

- Shows all queues with status Waiting, Calling, or Processing
- Sorted by priority: Processing → FastTrack Waiting → Normal Waiting (by created_at)
- FastTrack entries visually highlighted (badge/accent color)

### Action Buttons per Queue Entry

- 🔔 **Panggil**: Sets `is_notified = true` and `status = 'Calling'`
- ✂️ **Mulai**: Sets `status = 'Processing'`
- ✅ **Selesai**: Sets `status = 'Done'`

### Manual Entry

- Button to add a walk-in customer (type: 'Manual', name input)

### Fast Track (VIP)

- Button to add a VIP customer (type: 'FastTrack', name input)
- These are automatically sorted to be next in line after the current Processing customer

### Share to WhatsApp

- Button that opens WhatsApp with a pre-filled message containing the live customer page URL

---

## 4. UI/UX Design

- **Dark mode** with a masculine, modern barbershop aesthetic
- Dark background with warm accent colors (gold/amber tones)
- Large, bold queue numbers for accessibility
- Mobile-optimized layout (portrait 9:16)
- Minimal data usage — lightweight components, no heavy assets
- Smooth animations for status transitions
- Bell sound using a public audio URL for the notification

---

## 5. Technical Architecture

- **Routing**: `/` (customer), `/admin` (admin)
- **Supabase Client**: Configured with environment variables for easy migration to Replit
- **Realtime**: Supabase channel subscriptions for live queue updates
- **State Management**: React Query for data fetching, Supabase Realtime for live updates
- **Modular Code**: Clean separation — pages, components, hooks, lib folders
- **Sound**: Public URL audio file for bell notification

"Update logic for Queue Reset: Do NOT reset queue numbers daily. The queue must persist across days. Provide a 'Manual Archive' button for Admin to hide completed tasks, but unfinished tasks must stay at the top of the list for the next day."

> *"For the Fast Track entries in Admin Dashboard, make the card glow or use a gold gradient border to distinguish them from regular customers. Add a 'Total Daily Earnings' counter at the top of Admin Page that sums up current completed services for the day."*