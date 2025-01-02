import ProjectDetailsClient from '@/components/projects/ProjectDetailsClient'

interface ProjectDetailsPageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  return <ProjectDetailsClient projectId={params.id} />
} 