import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(email, order) {
  const itemsList = order.items
    .map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const textContent = `
Dear Customer,

Thank you for your order! Your order has been successfully placed.

Order Number: ${order.orderNumber}

Items:
${itemsList}

Shipping Address:
${order.shippingAddress.fullName}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

Subtotal: $${order.subtotal?.toFixed(2)}
Shipping: ${order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}
Tax: $${order.tax?.toFixed(2)}
${order.discount > 0 ? `Discount: -$${order.discount?.toFixed(2)}` : ''}
Total: $${order.total?.toFixed(2)}

You can track your order at: ${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderNumber}

Thank you for shopping with us!

Best regards,
ShopHub Team
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .order-details { margin: 20px 0; background: white; padding: 20px; border-radius: 8px; }
    .order-details h3 { margin-top: 0; color: #4F46E5; }
    .items { margin: 20px 0; }
    .item { padding: 15px; background: white; margin: 8px 0; border-radius: 8px; border-left: 4px solid #4F46E5; }
    .item-name { font-weight: 600; }
    .item-details { color: #666; font-size: 14px; margin-top: 4px; }
    .total { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total-row:last-child { border-bottom: none; font-size: 18px; font-weight: bold; color: #4F46E5; }
    .total-row.discount { color: #10B981; }
    .cta { text-align: center; margin-top: 25px; }
    .cta a { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; }
    .footer { text-align: center; padding: 25px 20px; color: #666; font-size: 13px; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
      <p>Order #${order.orderNumber}</p>
    </div>
    <div class="content">
      <p>Dear <strong>${order.shippingAddress.fullName}</strong>,</p>
      <p>Thank you for your order! We've received your purchase and are preparing it for shipment.</p>
      
      <div class="order-details">
        <h3>Shipping Address</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
      
      <div class="items">
        <h3>Your Order (${order.items.length} item${order.items.length > 1 ? 's' : ''})</h3>
        ${order.items.map(item => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-details">Qty: ${item.quantity} × $${item.price?.toFixed(2)} = <strong>$${(item.price * item.quantity).toFixed(2)}</strong></div>
          </div>
        `).join('')}
      </div>
      
      <div class="total">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$${order.subtotal?.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Shipping</span>
          <span>${order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</span>
        </div>
        <div class="total-row">
          <span>Tax</span>
          <span>$${order.tax?.toFixed(2)}</span>
        </div>
        ${order.discount > 0 ? `
        <div class="total-row discount">
          <span>Discount</span>
          <span>-$${order.discount?.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>Total</span>
          <span>$${order.total?.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="cta">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderNumber}">Track Your Order</a>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p><strong>ShopHub Team</strong></p>
      <p style="font-size: 11px; margin-top: 15px; opacity: 0.7;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: 'ShopHub <noreply@shophub.com>',
      to: email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      text: textContent,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderStatusUpdate(email, order, newStatus) {
  const statusMessages = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const textContent = `
Dear Customer,

${statusMessages[newStatus] || 'Your order status has been updated'}.

Order Number: ${order.orderNumber}
New Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}

${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}\nCarrier: ${order.carrier}` : ''}

Track your order at: ${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderNumber}

Thank you for shopping with us!

Best regards,
ShopHub Team
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .status-badge { display: inline-block; padding: 8px 20px; background: #4F46E5; color: white; border-radius: 20px; font-weight: 600; text-transform: capitalize; margin: 10px 0; }
    .tracking { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { text-align: center; padding: 25px 20px; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Update</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>${statusMessages[newStatus] || 'Your order status has been updated'}.</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <span class="status-badge">${newStatus}</span>
      </div>
      
      ${order.trackingNumber ? `
      <div class="tracking">
        <h3 style="margin-top: 0;">Tracking Information</h3>
        <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
        <p><strong>Carrier:</strong> ${order.carrier}</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderNumber}" style="background: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">View Order Details</a>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p><strong>ShopHub Team</strong></p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: 'ShopHub <noreply@shophub.com>',
      to: email,
      subject: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - #${order.orderNumber}`,
      text: textContent,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}
