import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: 'général',
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== 'général') {
    return null;
  }

  return redirect(`/serveurs/${params.serverId}/salons/${initialChannel?.id}`);
};

export default ServerIdPage;
