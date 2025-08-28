'use server';

import * as Sentry from '@sentry/nextjs'
import {prisma} from '@/db/prisma';
import { revalidatePath } from 'next/cache';


export async function createTicket(prevState :{success : boolean; message : string} ,formData : FormData) : Promise<{success: boolean; message :string}>{

    try {
        // throw new Error('Simulated Prisma error for testing')
    const subject = formData.get('subject') as string ;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string ;

    console.log(subject , description , priority);

    if(!subject || !description || !priority ){
        Sentry.captureMessage('Validation Error : Missing ticket fields' , 'warning')
        return {success: false , message : 'All fields are required'}
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
        data: {subject , description , priority}
    })

    Sentry.addBreadcrumb({
        category : 'ticket',
        message : `Ticket created : ${ticket.id}`,
        level : 'info'
    })

    Sentry.captureException(`Ticket was created successfully : ${ticket.id}`);

    revalidatePath('/tickets');

    return {success: true, message : 'Ticket created successfully'};
    } catch (error) {
        Sentry.captureException(error as Error, {
        extra: { formData: Object.fromEntries(formData.entries()) },
});
        return {success: false , message : 'An error occured while creating the ticket'}
    }

    
}