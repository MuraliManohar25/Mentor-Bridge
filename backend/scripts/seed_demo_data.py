import asyncio
import uuid
from datetime import datetime, timedelta

from app.db.session import AsyncSessionLocal, engine
from app.db.init_db import init_db
from app.models.user import User, Profile, UserRole
from app.models.mentorship import MentorshipRequest, MentorshipStatus
from app.models.community import Circle, CircleMember, CirclePost, CircleSession
from app.models.feed import Post, PostReaction, PostComment
from app.models.student_board import StudentBoardPost, StudentBoardResponse
from app.models.messaging import Conversation, ConversationMember, Message
from app.models.notification import Notification
from app.models.referral import Referral
from app.core.auth import get_password_hash
from sqlalchemy import select


async def seed():
    print("[SEED] Initializing Database tables...")
    await init_db(engine)

    async with AsyncSessionLocal() as db:
        # Check if seed users already exist
        res = await db.execute(select(User).where(User.email == "studenta@example.com"))
        if res.scalar_one_or_none():
            print("[SEED] Seed data already exists. Skipping duplicate seed creation.")
            return

        print("[SEED] Creating users...")
        pw_hash = get_password_hash("password123")

        # 1. Student A
        student_a = User(
            id=uuid.uuid4(),
            email="studenta@example.com",
            hashed_password=pw_hash,
            full_name="Alex Vance",
            role=UserRole.STUDENT,
            department="Computer Science",
            is_active=True,
            is_verified=True
        )
        profile_student_a = Profile(
            user_id=student_a.id,
            bio="Aspiring Software Engineer passionate about backend systems, distributed architectures, and AI integration.",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            graduation_year=2025,
            department="Computer Science",
            interests=["Software Engineering", "System Design", "Cloud Computing"],
            career_interests=["Backend Engineer", "DevOps"],
            points=120
        )

        # 2. Student B
        student_b = User(
            id=uuid.uuid4(),
            email="studentb@example.com",
            hashed_password=pw_hash,
            full_name="Maya Lin",
            role=UserRole.STUDENT,
            department="Electrical Engineering",
            is_active=True,
            is_verified=True
        )
        profile_student_b = Profile(
            user_id=student_b.id,
            bio="Final year EE student looking for robotics and embedded hardware mentors.",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            graduation_year=2024,
            department="Electrical Engineering",
            interests=["Robotics", "Embedded Systems", "Hardware Design"],
            career_interests=["Embedded Engineer", "Hardware Specialist"]
        )

        # 3. Brand New Student
        new_student = User(
            id=uuid.uuid4(),
            email="newstudent@example.com",
            hashed_password=pw_hash,
            full_name="Jordan Reed",
            role=UserRole.STUDENT,
            department="Information Technology",
            is_active=True,
            is_verified=True
        )
        profile_new_student = Profile(
            user_id=new_student.id,
            bio="Freshman looking to get guidance early in college.",
            graduation_year=2027,
            department="Information Technology"
        )

        # 4. Alumni A (Mentor)
        alumni_a = User(
            id=uuid.uuid4(),
            email="alumnia@example.com",
            hashed_password=pw_hash,
            full_name="Sarah Chen",
            role=UserRole.ALUMNI,
            department="Computer Science",
            is_active=True,
            is_verified=True
        )
        profile_alumni_a = Profile(
            user_id=alumni_a.id,
            bio="Senior Staff Software Engineer at TechCorp. 8+ years experience in distributed systems, Rust, and microservices architecture.",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            graduation_year=2018,
            department="Computer Science",
            current_company="TechCorp",
            current_position="Senior Staff Software Engineer",
            is_mentor=True,
            location="San Francisco, CA",
            linkedin_url="https://linkedin.com/in/sarahchen-demo",
            availability="Mon & Wed Evenings",
            mentorship_expertise=["Software Engineering", "System Design", "Career Growth", "Interview Prep"],
            referral_code="sarahchen-9f2a",
            points=450,
            badges=["Mentor of the Month", "Top Mentor", "Community Contributor"]
        )

        # 5. Alumni B (Mentor)
        alumni_b = User(
            id=uuid.uuid4(),
            email="alumnib@example.com",
            hashed_password=pw_hash,
            full_name="Rahul Sharma",
            role=UserRole.ALUMNI,
            department="Business Administration",
            is_active=True,
            is_verified=True
        )
        profile_alumni_b = Profile(
            user_id=alumni_b.id,
            bio="Product Lead at InnovateX. Helping students bridge product thinking, design, and business strategy.",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            graduation_year=2019,
            department="Business Administration",
            current_company="InnovateX",
            current_position="Lead Product Manager",
            is_mentor=True,
            location="New York, NY",
            linkedin_url="https://linkedin.com/in/rahulsharma-demo",
            availability="Weekends",
            mentorship_expertise=["Product Management", "Resume Review", "Offer Negotiation"],
            referral_code="rahulsharma-3c1b",
            points=310,
            badges=["Resume Mentor", "Top Mentor"]
        )

        # 6. Brand New Alumni
        new_alumni = User(
            id=uuid.uuid4(),
            email="newalumni@example.com",
            hashed_password=pw_hash,
            full_name="David Miller",
            role=UserRole.ALUMNI,
            department="Mechanical Engineering",
            is_active=True,
            is_verified=True
        )
        profile_new_alumni = Profile(
            user_id=new_alumni.id,
            bio="Recent graduate eager to give back.",
            graduation_year=2023,
            department="Mechanical Engineering",
            current_company="AeroMotion",
            current_position="Design Engineer",
            is_mentor=True,
            availability="Available"
        )

        db.add_all([
            student_a, profile_student_a,
            student_b, profile_student_b,
            new_student, profile_new_student,
            alumni_a, profile_alumni_a,
            alumni_b, profile_alumni_b,
            new_alumni, profile_new_alumni
        ])
        await db.flush()

        print("[SEED] Creating 1-to-1 Mentorship Requests...")
        req1 = MentorshipRequest(
            student_id=student_a.id,
            alumni_id=alumni_a.id,
            message="Hi Sarah, I would love your mentorship on backend system design and preparing for distributed systems interviews!",
            status=MentorshipStatus.ACCEPTED
        )
        req2 = MentorshipRequest(
            student_id=student_b.id,
            alumni_id=alumni_b.id,
            message="Hello Rahul, I'm transitioning towards product management roles in hardware/tech and would appreciate your guidance.",
            status=MentorshipStatus.PENDING
        )
        db.add_all([req1, req2])

        print("[SEED] Creating Community Circles...")
        circle1 = Circle(
            id=uuid.uuid4(),
            title="Backend System Architecture & Scale",
            description="A community for students interested in microservices, database design, caching, and scalable web architectures.",
            domain="Software Engineering",
            owner_id=alumni_a.id,
            capacity=25,
            current_members_count=2,
            schedule="Every Tuesday at 6 PM EST",
            cover_image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
        )
        db.add(circle1)
        await db.flush()

        db.add_all([
            CircleMember(circle_id=circle1.id, user_id=alumni_a.id),
            CircleMember(circle_id=circle1.id, user_id=student_a.id),
            CirclePost(
                circle_id=circle1.id,
                author_id=alumni_a.id,
                content="Welcome everyone! Next week we'll cover database indexing and partition strategies. Feel free to post questions here!"
            ),
            CircleSession(
                circle_id=circle1.id,
                title="Database Sharding & Caching Masterclass",
                description="Live interactive breakdown of Redis caching strategies and database sharding patterns.",
                scheduled_at=datetime.utcnow() + timedelta(days=3),
                meeting_link="https://meet.google.com/mb-backend-demo"
            )
        ])

        print("[SEED] Creating Mentor Feed Posts...")
        post1 = Post(
            id=uuid.uuid4(),
            author_id=alumni_a.id,
            content="5 Key things I look for when reviewing junior software engineering resumes: 1. Quantified impact (e.g. reduced latency by 30%). 2. Production deployments. 3. Clean git commit histories. 4. Concise summary. 5. Clear link to personal projects!",
            post_type="advice",
            visibility="public",
            likes_count=1,
            comments_count=1
        )
        db.add(post1)
        await db.flush()

        db.add_all([
            PostReaction(post_id=post1.id, user_id=student_a.id, reaction_type="like"),
            PostComment(post_id=post1.id, author_id=student_a.id, content="This is super helpful advice Sarah! Thank you!")
        ])

        print("[SEED] Creating Student Board Questions...")
        sb_post = StudentBoardPost(
            id=uuid.uuid4(),
            student_id=student_a.id,
            title="How to prepare for system design interviews as a graduating senior?",
            content="I have mock interviews coming up in 2 weeks. What resources or topics should I focus on first?",
            domain="Software Engineering",
            status="answered"
        )
        db.add(sb_post)
        await db.flush()

        db.add(StudentBoardResponse(
            post_id=sb_post.id,
            alumni_id=alumni_a.id,
            content="Start with fundamentals: load balancers, CDN, SQL vs NoSQL, and caching. Practice drawing system diagrams for URLs shorteners or chat apps!"
        ))

        print("[SEED] Creating Direct Messaging Conversations...")
        conv = Conversation(id=uuid.uuid4())
        db.add(conv)
        await db.flush()

        db.add_all([
            ConversationMember(conversation_id=conv.id, user_id=student_a.id),
            ConversationMember(conversation_id=conv.id, user_id=alumni_a.id),
            Message(
                conversation_id=conv.id,
                sender_id=student_a.id,
                content="Hi Sarah! Thanks for accepting my mentorship request!"
            ),
            Message(
                conversation_id=conv.id,
                sender_id=alumni_a.id,
                content="Glad to connect Alex! Looking forward to helping you with your tech goals."
            )
        ])

        print("[SEED] Creating Notifications...")
        db.add_all([
            Notification(
                user_id=student_a.id,
                type="mentorship_accepted",
                title="Mentorship Request Accepted!",
                message="Sarah Chen accepted your 1-to-1 mentorship request.",
                link_url="/messages"
            ),
            Notification(
                user_id=alumni_a.id,
                type="mentorship_request",
                title="New Mentorship Request",
                message="Alex Vance requested 1-to-1 mentorship with you.",
                link_url="/alumni/dashboard"
            )
        ])

        await db.commit()
        print("[SEED] Demo database seed complete! Test accounts created:")
        print("  - Student A: studenta@example.com / password123")
        print("  - Student B: studentb@example.com / password123")
        print("  - New Student: newstudent@example.com / password123")
        print("  - Alumni A (Mentor): alumnia@example.com / password123")
        print("  - Alumni B (Mentor): alumnib@example.com / password123")
        print("  - New Alumni: newalumni@example.com / password123")


if __name__ == "__main__":
    asyncio.run(seed())
