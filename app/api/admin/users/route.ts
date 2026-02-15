import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Mock users data
    const mockUsers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@techsolutions.com',
        phone: '+91-9876543210',
        role: 'SUPPLIER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 12,
          leads: 8,
          transactions: 5
        }
      },
      {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@steelworks.com',
        phone: '+91-9876543211',
        role: 'SUPPLIER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 8,
          leads: 15,
          transactions: 3
        }
      },
      {
        id: '3',
        name: 'Amit Patel',
        email: 'amit@textilemills.com',
        phone: '+91-9876543212',
        role: 'SUPPLIER',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 5,
          leads: 3,
          transactions: 1
        }
      },
      {
        id: '4',
        name: 'Sunita Singh',
        email: 'sunita@machineryhub.com',
        phone: '+91-9876543213',
        role: 'SUPPLIER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 20,
          leads: 12,
          transactions: 8
        }
      },
      {
        id: '5',
        name: 'Vikram Reddy',
        email: 'vikram@chemicalind.com',
        phone: '+91-9876543214',
        role: 'SUPPLIER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 15,
          leads: 9,
          transactions: 6
        }
      },
      {
        id: '6',
        name: 'Anita Gupta',
        email: 'anita@buyer.com',
        phone: '+91-9876543215',
        role: 'BUYER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 3,
          leads: 0,
          transactions: 2
        }
      },
      {
        id: '7',
        name: 'Ravi Verma',
        email: 'ravi@buyer.com',
        phone: '+91-9876543216',
        role: 'BUYER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          rfqs: 7,
          leads: 0,
          transactions: 4
        }
      }
    ];

    // Filter users based on search criteria
    let filteredUsers = mockUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phone.includes(search)
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    const response = {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limit)
      },
      stats: {
        totalUsers: mockUsers.length,
        buyers: mockUsers.filter(u => u.role === 'BUYER').length,
        suppliers: mockUsers.filter(u => u.role === 'SUPPLIER').length,
        activeUsers: mockUsers.filter(u => u.isActive).length,
        newUsersThisWeek: 3
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, updates } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      error: 'Failed to update user' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Soft delete - deactivate user instead of hard delete
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json({ 
      error: 'Failed to deactivate user' 
    }, { status: 500 });
  }
}
