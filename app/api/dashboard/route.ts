import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')

    // Get total users count
    if (metric === 'users') {
      const totalUsers = await prisma.users.count()
      return NextResponse.json({ 
        success: true, 
        totalUsers 
      })
    }

    // Get total orders count
    if (metric === 'orders') {
      const totalOrders = await prisma.orders.count()
      return NextResponse.json({ 
        success: true, 
        totalOrders 
      })
    }

    // Get paid orders count (successful orders)
    if (metric === 'paid-orders') {
      const paidOrders = await prisma.orders.count({
        where: {
          status: {
            not: 'cancelled'
          },
          payment_status: 'paid'
        }
      })
      return NextResponse.json({ 
        success: true, 
        paidOrders 
      })
    }

    // Get total order value (revenue) - exclude only cancelled orders
    if (metric === 'revenue') {
      const result = await prisma.orders.aggregate({
        where: {
          status: {
            not: 'cancelled'
          }
        },
        _sum: {
          total_amount: true
        }
      })
      
      const totalRevenue = result._sum.total_amount || 0
      return NextResponse.json({ 
        success: true, 
        totalRevenue: Number(totalRevenue)
      })
    }

    // Get total products count
    if (metric === 'products') {
      const totalProducts = await prisma.products.count()
      return NextResponse.json({ 
        success: true, 
        totalProducts 
      })
    }

    // Get total services count
    if (metric === 'services') {
      const totalServices = await prisma.services.count()
      return NextResponse.json({ 
        success: true, 
        totalServices 
      })
    }

    // Get total astrologers count
    if (metric === 'astrologers') {
      const totalAstrologers = await prisma.astrologer.count()
      return NextResponse.json({ 
        success: true, 
        totalAstrologers 
      })
    }

    // Get monthly revenue data
    if (metric === 'monthly-revenue') {
      const months = parseInt(searchParams.get('months') || '12')
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - months)

      const monthlyData = await prisma.orders.groupBy({
        by: ['created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          status: {
            not: 'cancelled'
          }
        },
        _sum: {
          total_amount: true
        },
        _count: {
          id: true
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      // Group by month and format data
      const monthlyRevenueMap = new Map<string, { revenue: number; orders: number }>()
      
      monthlyData.forEach(order => {
        const monthKey = order.created_at.toISOString().substring(0, 7) // YYYY-MM
        const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, orders: 0 }
        monthlyRevenueMap.set(monthKey, {
          revenue: existing.revenue + Number(order._sum.total_amount || 0),
          orders: existing.orders + order._count.id
        })
      })

      // Generate complete month range
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const result = []
      
      for (let i = 0; i < months; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - (months - 1 - i))
        const monthKey = date.toISOString().substring(0, 7)
        const monthData = monthlyRevenueMap.get(monthKey) || { revenue: 0, orders: 0 }
        
        result.push({
          month: monthNames[date.getMonth()],
          revenue: monthData.revenue,
          orders: monthData.orders,
          year: date.getFullYear()
        })
      }

      return NextResponse.json({ 
        success: true, 
        monthlyRevenue: result 
      })
    }

    // Get weekly revenue data
    if (metric === 'weekly-revenue') {
      const weeks = parseInt(searchParams.get('weeks') || '8')
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - (weeks * 7))

      const weeklyData = await prisma.orders.groupBy({
        by: ['created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          status: {
            not: 'cancelled'
          }
        },
        _sum: {
          total_amount: true
        },
        _count: {
          id: true
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      // Group by week and format data
      const weeklyRevenueMap = new Map<string, { revenue: number; orders: number }>()
      
      weeklyData.forEach(order => {
        const weekStart = new Date(order.created_at)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
        const weekKey = weekStart.toISOString().substring(0, 10)
        const existing = weeklyRevenueMap.get(weekKey) || { revenue: 0, orders: 0 }
        weeklyRevenueMap.set(weekKey, {
          revenue: existing.revenue + Number(order._sum.total_amount || 0),
          orders: existing.orders + order._count.id
        })
      })

      // Generate complete week range
      const result = []
      
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (weeks - 1 - i) * 7)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
        const weekKey = weekStart.toISOString().substring(0, 10)
        const weekData = weeklyRevenueMap.get(weekKey) || { revenue: 0, orders: 0 }
        
        result.push({
          week: `W${i + 1}`,
          revenue: weekData.revenue,
          orders: weekData.orders,
          date: weekStart.toISOString().substring(0, 10)
        })
      }

      return NextResponse.json({ 
        success: true, 
        weeklyRevenue: result 
      })
    }

    // Get revenue growth percentage
    if (metric === 'revenue-growth') {
      const currentPeriod = new Date()
      const previousPeriod = new Date()
      previousPeriod.setMonth(currentPeriod.getMonth() - 1)

      const [currentRevenue, previousRevenue] = await Promise.all([
        prisma.orders.aggregate({
          where: {
            created_at: {
              gte: new Date(currentPeriod.getFullYear(), currentPeriod.getMonth(), 1),
              lt: new Date(currentPeriod.getFullYear(), currentPeriod.getMonth() + 1, 1)
            },
            status: {
              not: 'cancelled'
            }
          },
          _sum: {
            total_amount: true
          }
        }),
        prisma.orders.aggregate({
          where: {
            created_at: {
              gte: new Date(previousPeriod.getFullYear(), previousPeriod.getMonth(), 1),
              lt: new Date(previousPeriod.getFullYear(), previousPeriod.getMonth() + 1, 1)
            },
            status: {
              not: 'cancelled'
            }
          },
          _sum: {
            total_amount: true
          }
        })
      ])

      const current = Number(currentRevenue._sum.total_amount || 0)
      const previous = Number(previousRevenue._sum.total_amount || 0)
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0

      return NextResponse.json({ 
        success: true, 
        revenueGrowth: Math.round(growth * 100) / 100 
      })
    }

    // Get top services based on revenue and bookings
    if (metric === 'top-services') {
      const limit = parseInt(searchParams.get('limit') || '5')
      
      const topServices = await prisma.services.findMany({
        include: {
          order_items: {
            where: {
              orders: {
                status: {
                  not: 'cancelled'
                }
              }
            },
            include: {
              orders: true
            }
          },
          service_media: {
            where: {
              is_primary: true,
              is_active: true
            },
            take: 1
          }
        },
        take: limit
      })

      const servicesWithStats = topServices.map(service => {
        const totalRevenue = service.order_items.reduce((sum, item) => {
          return sum + Number(item.total_price)
        }, 0)
        
        const totalBookings = service.order_items.length
        const averageRating = 4.6 // Default rating since we don't have review system yet
        
        return {
          id: service.id,
          name: service.title,
          image: service.service_media[0]?.media_url || '/placeholder.jpg',
          review: averageRating,
          bookings: totalBookings,
          revenue: totalRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue)

      return NextResponse.json({ 
        success: true, 
        topServices: servicesWithStats 
      })
    }

    // Get top products based on revenue and sales
    if (metric === 'top-products') {
      const limit = parseInt(searchParams.get('limit') || '5')
      
      const topProducts = await prisma.products.findMany({
        include: {
          order_items: {
            where: {
              orders: {
                status: {
                  not: 'cancelled'
                }
              }
            },
            include: {
              orders: true
            }
          },
          product_media: {
            where: {
              is_primary: true,
              is_active: true
            },
            take: 1
          }
        },
        take: limit
      })

      const productsWithStats = topProducts.map(product => {
        const totalRevenue = product.order_items.reduce((sum, item) => {
          return sum + Number(item.total_price)
        }, 0)
        
        const totalSold = product.order_items.reduce((sum, item) => {
          return sum + item.quantity
        }, 0)
        
        const averageRating = 4.5 // Default rating since we don't have review system yet
        const profit = totalRevenue * 0.3 // Assuming 30% profit margin
        
        return {
          id: product.id,
          name: product.name,
          image: product.product_media[0]?.media_url || product.image_url || '/placeholder.jpg',
          review: averageRating,
          sold: totalSold,
          profit: profit
        }
      }).sort((a, b) => b.profit - a.profit)

      return NextResponse.json({ 
        success: true, 
        topProducts: productsWithStats 
      })
    }

    // Get top astrologers based on bookings and revenue
    if (metric === 'top-astrologers') {
      const limit = parseInt(searchParams.get('limit') || '5')
      
      const topAstrologers = await prisma.astrologer.findMany({
        include: {
          booking: {
            where: {
              status: {
                not: 'cancelled'
              }
            },
            include: {
              payment: true
            }
          }
        },
        take: limit
      })

      const astrologersWithStats = topAstrologers.map(astrologer => {
        const totalConsultations = astrologer.booking.length
        const totalRevenue = astrologer.booking.reduce((sum, booking) => {
          const paymentAmount = booking.payment.reduce((paymentSum, payment) => {
            return paymentSum + Number(payment.amount)
          }, 0)
          return sum + paymentAmount
        }, 0)
        
        // Use real rating from astrologer table (updated by rating system)
        const averageRating = Number(astrologer.rating || 0)
        
        return {
          id: astrologer.id,
          name: `${astrologer.firstName} ${astrologer.lastName}`,
          image: astrologer.profileImage || '/images/placeholder-author.jpg',
          review: averageRating,
          consultations: totalConsultations,
          revenue: totalRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue)

      return NextResponse.json({ 
        success: true, 
        topAstrologers: astrologersWithStats 
      })
    }

    // Get revenue breakdown by category
    if (metric === 'revenue-breakdown') {
      // Get product revenue
      const productRevenueResult = await prisma.order_items.aggregate({
        where: {
          item_type: 'product',
          orders: {
            status: {
              not: 'cancelled'
            }
          }
        },
        _sum: {
          total_price: true
        }
      })

      // Get service revenue
      const serviceRevenueResult = await prisma.order_items.aggregate({
        where: {
          item_type: 'service',
          orders: {
            status: {
              not: 'cancelled'
            }
          }
        },
        _sum: {
          total_price: true
        }
      })

      // Get astrologer revenue (from bookings)
      const astrologerRevenueResult = await prisma.payment.aggregate({
        where: {
          booking: {
            status: {
              not: 'cancelled'
            }
          }
        },
        _sum: {
          amount: true
        }
      })

      // Get total orders for average order value calculation
      const totalOrdersResult = await prisma.orders.count({
        where: {
          status: {
            not: 'cancelled'
          }
        }
      })

      // Get total revenue for average order value
      const totalRevenueResult = await prisma.orders.aggregate({
        where: {
          status: {
            not: 'cancelled'
          }
        },
        _sum: {
          total_amount: true
        }
      })

      const productRevenue = Number(productRevenueResult._sum.total_price || 0)
      const serviceRevenue = Number(serviceRevenueResult._sum.total_price || 0)
      const astrologerRevenue = Number(astrologerRevenueResult._sum.amount || 0)
      const totalRevenue = productRevenue + serviceRevenue + astrologerRevenue
      const totalOrders = totalOrdersResult
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

      // Create revenue breakdown array
      const revenueBreakdown = [
        { name: 'Products', value: productRevenue, color: '#3b82f6' },
        { name: 'Services', value: serviceRevenue, color: '#8b5cf6' },
        { name: 'Astrologers', value: astrologerRevenue, color: '#10b981' }
      ]

      // Find top segment
      const topSegment = revenueBreakdown.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), revenueBreakdown[0])
      const breakdownShare = totalRevenue > 0 ? Math.round((topSegment.value / totalRevenue) * 100) : 0

      // Get top contributors (top 5 from all categories)
      const [topProducts, topServices, topAstrologers] = await Promise.all([
        // Top 3 products
        prisma.products.findMany({
          include: {
            order_items: {
              where: {
                orders: {
                  status: {
                    not: 'cancelled'
                  }
                }
              }
            },
            product_media: {
              where: {
                is_primary: true,
                is_active: true
              },
              take: 1
            }
          },
          take: 3
        }),
        // Top 3 services
        prisma.services.findMany({
          include: {
            order_items: {
              where: {
                orders: {
                  status: {
                    not: 'cancelled'
                  }
                }
              }
            },
            service_media: {
              where: {
                is_primary: true,
                is_active: true
              },
              take: 1
            }
          },
          take: 3
        }),
        // Top 3 astrologers
        prisma.astrologer.findMany({
          include: {
            booking: {
              where: {
                status: {
                  not: 'cancelled'
                }
              },
              include: {
                payment: true
              }
            }
          },
          take: 3
        })
      ])

      // Process contributors
      const productContributors = topProducts.map(product => {
        const revenue = product.order_items.reduce((sum, item) => sum + Number(item.total_price), 0)
        return {
          name: product.name,
          image: product.product_media[0]?.media_url || product.image_url || '/placeholder.jpg',
          type: 'Product',
          revenue: revenue
        }
      })

      const serviceContributors = topServices.map(service => {
        const revenue = service.order_items.reduce((sum, item) => sum + Number(item.total_price), 0)
        return {
          name: service.title,
          image: service.service_media[0]?.media_url || '/placeholder.jpg',
          type: 'Service',
          revenue: revenue
        }
      })

      const astrologerContributors = topAstrologers.map(astrologer => {
        const revenue = astrologer.booking.reduce((sum, booking) => {
          return sum + booking.payment.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0)
        }, 0)
        return {
          name: `${astrologer.firstName} ${astrologer.lastName}`,
          image: astrologer.profileImage || '/images/placeholder-author.jpg',
          type: 'Astrologer',
          revenue: revenue
        }
      })

      // Combine and sort all contributors
      const allContributors = [...productContributors, ...serviceContributors, ...astrologerContributors]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      return NextResponse.json({
        success: true,
        revenueBreakdown: {
          breakdown: revenueBreakdown,
          totalRevenue,
          avgOrderValue,
          topSegment,
          breakdownShare,
          contributors: allContributors
        }
      })
    }

    // Visitors overview (from visitors and page_visits)
    if (metric === 'visitors-overview') {
      const now = new Date()
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30)

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const [totalVisitors, newVisitors, returningVisitors, totalPageViews, todayPageViews] = await Promise.all([
        prisma.visitors.count(),
        prisma.visitors.count({
          where: {
            OR: [
              { first_visit: { gte: thirtyDaysAgo } },
              { last_visit: { gte: thirtyDaysAgo } }
            ]
          }
        }),
        prisma.visitors.count({
          where: {
            visit_count: {
              gt: 1
            }
          }
        }),
        prisma.page_visits.count(),
        prisma.page_visits.count({
          where: {
            timestamp: {
              gte: startOfToday
            }
          }
        })
      ])

      return NextResponse.json({
        success: true,
        visitorsOverview: {
          totalVisitors,
          newVisitors,
          returningVisitors,
          totalPageViews,
          todayPageViews
        }
      })
    }

    // Popular pages (top paths by views)
    if (metric === 'popular-pages') {
      const limit = parseInt(searchParams.get('limit') || '5')

      const grouped = await prisma.page_visits.groupBy({
        by: ['path'],
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: limit
      })

      const popularPages = grouped.map(g => ({ path: g.path, views: g._count.id }))

      return NextResponse.json({ success: true, popularPages })
    }

    // Visits trend (last N days)
    if (metric === 'visits-trend') {
      const days = parseInt(searchParams.get('days') || '14')
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - (days - 1))

      // Use SQL aggregation by DATE() for MySQL
      const rows = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`\
        SELECT DATE(timestamp) AS date, COUNT(*) AS count\
        FROM page_visits\
        WHERE timestamp BETWEEN ${startDate} AND ${endDate}\
        GROUP BY DATE(timestamp)\
        ORDER BY date ASC;
      `

      // Fill missing dates with zero
      const trend: { date: string; views: number }[] = []
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate)
        d.setDate(startDate.getDate() + i)
        const key = d.toISOString().substring(0, 10)
        const match = rows.find(r => new Date(r.date).toISOString().substring(0, 10) === key)
        const views = match ? Number(match.count) : 0
        trend.push({ date: key, views })
      }

      return NextResponse.json({ success: true, visitsTrend: trend })
    }

    // Get all basic metrics
    const [totalUsers, totalOrders, revenueResult, totalProducts, totalServices, totalAstrologers] = await Promise.all([
      prisma.users.count(),
      prisma.orders.count(),
      prisma.orders.aggregate({
        where: {
          status: {
            not: 'cancelled'
          }
        },
        _sum: {
          total_amount: true
        }
      }),
      prisma.products.count(),
      prisma.services.count(),
      prisma.astrologer.count()
    ])

    const totalRevenue = Number(revenueResult._sum.total_amount || 0)

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        totalServices,
        totalAstrologers
      }
    })

  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data' 
      }, 
      { status: 500 }
    )
  }
}
