import { NextResponse } from 'next/server';
import { MemberRole } from '@prisma/client';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    if (!profile) {
      return new NextResponse('Non Autorisé', { status: 401 });
    }
    if (!serverId) {
      return new NextResponse('Identifiant du serveur manquant', {
        status: 400,
      });
    }
    if (!params.channelId) {
      return new NextResponse('Identifiant du salon manquant', { status: 400 });
    }
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: 'général',
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log('[CHANNEL_ID_DELETE]', error);
    return new NextResponse('Erreur Interne', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    if (!profile) {
      return new NextResponse('Non Autorisé', { status: 401 });
    }
    if (!serverId) {
      return new NextResponse('Identifiant du serveur manquant', {
        status: 400,
      });
    }
    if (!params.channelId) {
      return new NextResponse('Identifiant du salon manquant', { status: 400 });
    }
    if (name === 'général') {
      return new NextResponse("Le nom ne peut pas être 'général'", {
        status: 400,
      });
    }
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: 'général',
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log('[CHANNEL_ID_PATCH]', error);
    return new NextResponse('Erreur Interne', { status: 500 });
  }
}
