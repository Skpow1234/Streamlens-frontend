// API Response Types
export interface VideoEvent {
  id: number
  video_id: string
  current_time: number
  time: string
  video_state_label: string
  video_state_value: number
}

export interface TopVideo {
  video_id: string
  avg_viewership: number
  max_viewership: number
  total_views: number
  total_events: number
  unique_views: number
  time: string
}

export interface User {
  username: string
  email?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface WatchSessionResponse {
  watch_session_id: string
}

export interface YouTubeInfo {
  videoId: string | null
  time: number
}

// Component Props Types
export interface PageContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export interface MetricsTableProps {
  videoId: string
}

export interface TimeBucketSelectorProps {
  bucket: number
  setBucket: (bucket: number) => void
  bucketUnit: string
  setBucketUnit: (unit: string) => void
}

// Hook Return Types
export interface PlayerState {
  isReady: boolean
  current_time: number
  video_title: string
  video_state_label: string
  video_state_value: number
}

// Global JSX Types
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
