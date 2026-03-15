--
-- PostgreSQL database dump
--

\restrict T39LxEGKUsWUa9l9ree6KSr3BM6s1Hnt5a792xJpDyGwivke2vjqQW89JMl4YaG

-- Dumped from database version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)
-- Dumped by pg_dump version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action (
    id bigint NOT NULL,
    icon character varying(200),
    name character varying(200) NOT NULL,
    url character varying(200) NOT NULL
);


ALTER TABLE public.action OWNER TO postgres;

--
-- Name: action_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.action_id_seq OWNER TO postgres;

--
-- Name: action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_id_seq OWNED BY public.action.id;


--
-- Name: best_competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.best_competence (
    name character varying(255) NOT NULL,
    avg_rating double precision
);


ALTER TABLE public.best_competence OWNER TO postgres;

--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id bigint NOT NULL,
    name character varying(200) NOT NULL
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_id_seq OWNER TO postgres;

--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- Name: competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competence (
    id character varying(255) NOT NULL,
    description character varying(3000),
    indicator_level integer,
    indicator_name character varying(3000),
    name character varying(3000) NOT NULL,
    passing_indicator integer,
    type character varying(500),
    competence_group_id character varying(255),
    responsible_manager_id bigint
);


ALTER TABLE public.competence OWNER TO postgres;

--
-- Name: competence_cluster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competence_cluster (
    id bigint NOT NULL,
    name character varying(1000) NOT NULL,
    type character varying(500)
);


ALTER TABLE public.competence_cluster OWNER TO postgres;

--
-- Name: competence_equality; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competence_equality (
    id bigint NOT NULL,
    is_num_of_question_per_level_equal boolean,
    competence_id character varying(255),
    test_id bigint
);


ALTER TABLE public.competence_equality OWNER TO postgres;

--
-- Name: competence_equality_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.competence_equality_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.competence_equality_id_seq OWNER TO postgres;

--
-- Name: competence_equality_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.competence_equality_id_seq OWNED BY public.competence_equality.id;


--
-- Name: competence_family; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competence_family (
    id bigint NOT NULL,
    name character varying(1000) NOT NULL,
    type character varying(500),
    competence_cluster_id bigint
);


ALTER TABLE public.competence_family OWNER TO postgres;

--
-- Name: competence_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competence_group (
    id character varying(255) NOT NULL,
    name character varying(1000) NOT NULL,
    type character varying(500),
    competence_family_id bigint
);


ALTER TABLE public.competence_group OWNER TO postgres;

--
-- Name: course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course (
    id bigint NOT NULL,
    description character varying(1000),
    name character varying(300) NOT NULL,
    path character varying(500),
    competence_id character varying(255),
    info character varying(5000),
    table_of_contents character varying(5000)
);


ALTER TABLE public.course OWNER TO postgres;

--
-- Name: course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_id_seq OWNER TO postgres;

--
-- Name: course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_id_seq OWNED BY public.course.id;


--
-- Name: hse_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hse_group (
    id character varying(200) NOT NULL,
    min_question_count_hse integer,
    name character varying(500) NOT NULL,
    program character varying(200) NOT NULL,
    risk_priority integer,
    total_question_count_hse integer
);


ALTER TABLE public.hse_group OWNER TO postgres;

--
-- Name: hse_group_competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hse_group_competence (
    hse_group_id character varying(200) NOT NULL,
    competence_id character varying(255) NOT NULL
);


ALTER TABLE public.hse_group_competence OWNER TO postgres;

--
-- Name: hse_requirement_rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hse_requirement_rating (
    id bigint NOT NULL,
    fulfill boolean,
    score integer,
    competence_id character varying(255),
    test_id bigint,
    user_profile_id bigint
);


ALTER TABLE public.hse_requirement_rating OWNER TO postgres;

--
-- Name: hse_requirement_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hse_requirement_rating_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hse_requirement_rating_id_seq OWNER TO postgres;

--
-- Name: hse_requirement_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hse_requirement_rating_id_seq OWNED BY public.hse_requirement_rating.id;


--
-- Name: hse_stats_competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hse_stats_competence (
    competence_id character varying(255) NOT NULL,
    achieved double precision,
    competence_name character varying(255),
    max double precision,
    planned double precision
);


ALTER TABLE public.hse_stats_competence OWNER TO postgres;

--
-- Name: menu_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_option (
    id bigint NOT NULL,
    icon character varying(200),
    name character varying(200) NOT NULL,
    ordinal_number bigint NOT NULL,
    url character varying(200),
    parent_id bigint
);


ALTER TABLE public.menu_option OWNER TO postgres;

--
-- Name: menu_option_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_option_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_option_id_seq OWNER TO postgres;

--
-- Name: menu_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_option_id_seq OWNED BY public.menu_option.id;


--
-- Name: menu_option_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_option_role (
    menu_option_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.menu_option_role OWNER TO postgres;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id bigint NOT NULL,
    created_at timestamp without time zone,
    created_by_system boolean,
    message character varying(500) NOT NULL,
    status character varying(100) NOT NULL,
    updated_at timestamp without time zone,
    url character varying(200),
    created_by_user_profile_id bigint,
    user_profile_id bigint
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_seq OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: organisational_unit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organisational_unit (
    id bigint NOT NULL,
    name character varying(200),
    company_id bigint,
    organisational_unit_superior_id bigint
);


ALTER TABLE public.organisational_unit OWNER TO postgres;

--
-- Name: organisational_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organisational_unit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organisational_unit_id_seq OWNER TO postgres;

--
-- Name: organisational_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organisational_unit_id_seq OWNED BY public.organisational_unit.id;


--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id bigint NOT NULL,
    entity_type character varying(200) NOT NULL,
    action_id bigint,
    role_id bigint
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permission_id_seq OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;


--
-- Name: position; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."position" (
    id character varying(255) NOT NULL,
    name character varying(200) NOT NULL,
    hse_group_id character varying(200)
);


ALTER TABLE public."position" OWNER TO postgres;

--
-- Name: position_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_stats (
    "position" character varying(255) NOT NULL,
    less_then_70 integer,
    more_then_70 integer
);


ALTER TABLE public.position_stats OWNER TO postgres;

--
-- Name: position_tc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_tc (
    id character varying(255) NOT NULL,
    name character varying(200) NOT NULL
);


ALTER TABLE public.position_tc OWNER TO postgres;

--
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question (
    id bigint NOT NULL,
    answer_time integer,
    correct_answers character varying(5000),
    external_id character varying(255),
    image_path character varying(5000),
    level integer,
    number_of_try integer,
    possible_answers character varying(5000),
    question_type character varying(255),
    text character varying(5000),
    competence_id character varying(255)
);


ALTER TABLE public.question OWNER TO postgres;

--
-- Name: question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_id_seq OWNER TO postgres;

--
-- Name: question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;


--
-- Name: requirement_rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirement_rating (
    id bigint NOT NULL,
    fulfill boolean,
    rating double precision,
    test_id bigint,
    test_requirement_id bigint,
    user_profile_id bigint
);


ALTER TABLE public.requirement_rating OWNER TO postgres;

--
-- Name: requirement_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requirement_rating_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requirement_rating_id_seq OWNER TO postgres;

--
-- Name: requirement_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requirement_rating_id_seq OWNED BY public.requirement_rating.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id bigint NOT NULL,
    name character varying(200) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: statistics_competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistics_competence (
    competence_id character varying(255) NOT NULL,
    achieved double precision,
    competence_name character varying(255),
    planned double precision
);


ALTER TABLE public.statistics_competence OWNER TO postgres;

--
-- Name: test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test (
    id bigint NOT NULL,
    created_at timestamp without time zone,
    description character varying(500),
    iteration integer,
    name character varying(300) NOT NULL,
    sys_description character varying(300),
    total_time integer,
    type character varying(500),
    created_by bigint,
    hse_group_id character varying(200),
    test_template_id bigint,
    parent_test_id bigint
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: test_answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_answer (
    id bigint NOT NULL,
    answer character varying(1000),
    correct boolean,
    question_id bigint,
    test_result_id bigint
);


ALTER TABLE public.test_answer OWNER TO postgres;

--
-- Name: test_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_answer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_answer_id_seq OWNER TO postgres;

--
-- Name: test_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_answer_id_seq OWNED BY public.test_answer.id;


--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_id_seq OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: test_question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_question (
    test_id bigint NOT NULL,
    question_id bigint NOT NULL
);


ALTER TABLE public.test_question OWNER TO postgres;

--
-- Name: test_requirement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_requirement (
    id bigint NOT NULL,
    ponder integer,
    competence_id character varying(255),
    position_tc_id character varying(255),
    test_template_id bigint
);


ALTER TABLE public.test_requirement OWNER TO postgres;

--
-- Name: test_requirement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_requirement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_requirement_id_seq OWNER TO postgres;

--
-- Name: test_requirement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_requirement_id_seq OWNED BY public.test_requirement.id;


--
-- Name: test_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_result (
    id bigint NOT NULL,
    date_time timestamp(6) without time zone,
    passed boolean,
    percentage double precision,
    remaining_time integer,
    stopped boolean,
    test_id bigint,
    user_profile_id bigint
);


ALTER TABLE public.test_result OWNER TO postgres;

--
-- Name: test_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_result_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_result_id_seq OWNER TO postgres;

--
-- Name: test_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_result_id_seq OWNED BY public.test_result.id;


--
-- Name: test_template; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_template (
    id bigint NOT NULL,
    created_at date,
    name character varying(500) NOT NULL
);


ALTER TABLE public.test_template OWNER TO postgres;

--
-- Name: test_template_competence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_template_competence (
    id bigint NOT NULL,
    number_of_questions integer,
    competence_id character varying(255),
    test_template_id bigint
);


ALTER TABLE public.test_template_competence OWNER TO postgres;

--
-- Name: test_template_competence_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_template_competence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_template_competence_id_seq OWNER TO postgres;

--
-- Name: test_template_competence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_template_competence_id_seq OWNED BY public.test_template_competence.id;


--
-- Name: test_user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_user_profile (
    test_id bigint NOT NULL,
    user_profile_id bigint NOT NULL
);


ALTER TABLE public.test_user_profile OWNER TO postgres;

--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id bigint NOT NULL,
    email character varying(200),
    end_date date,
    image_path character varying(300),
    lastname_firstname character varying(200),
    password character varying(300),
    phone character varying(50),
    sap_id bigint NOT NULL,
    start_date date,
    sys_description character varying(200),
    username character varying(200),
    hse_manager_id bigint,
    manager_id bigint,
    organisational_unit_id bigint,
    position_id character varying(255),
    hse_blocked boolean,
    position_tc_id character varying(255),
    "id,""email"",""end_date"",""image_path"",""lastname_firstname"",""passwo" character varying(256)
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- Name: user_profile_course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_course (
    id bigint NOT NULL,
    confirmed boolean,
    course_id bigint,
    test_id bigint,
    user_profile_id bigint,
    start_time timestamp(6) without time zone
);


ALTER TABLE public.user_profile_course OWNER TO postgres;

--
-- Name: user_profile_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_course_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_course_id_seq OWNER TO postgres;

--
-- Name: user_profile_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_course_id_seq OWNED BY public.user_profile_course.id;


--
-- Name: user_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_id_seq OWNER TO postgres;

--
-- Name: user_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_id_seq OWNED BY public.user_profile.id;


--
-- Name: user_profile_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_role (
    user_profile_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.user_profile_role OWNER TO postgres;

--
-- Name: action id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action ALTER COLUMN id SET DEFAULT nextval('public.action_id_seq'::regclass);


--
-- Name: company id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- Name: competence_equality id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_equality ALTER COLUMN id SET DEFAULT nextval('public.competence_equality_id_seq'::regclass);


--
-- Name: course id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course ALTER COLUMN id SET DEFAULT nextval('public.course_id_seq'::regclass);


--
-- Name: hse_requirement_rating id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_requirement_rating ALTER COLUMN id SET DEFAULT nextval('public.hse_requirement_rating_id_seq'::regclass);


--
-- Name: menu_option id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_option ALTER COLUMN id SET DEFAULT nextval('public.menu_option_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: organisational_unit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisational_unit ALTER COLUMN id SET DEFAULT nextval('public.organisational_unit_id_seq'::regclass);


--
-- Name: permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);


--
-- Name: question id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: requirement_rating id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_rating ALTER COLUMN id SET DEFAULT nextval('public.requirement_rating_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Name: test_answer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answer ALTER COLUMN id SET DEFAULT nextval('public.test_answer_id_seq'::regclass);


--
-- Name: test_requirement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_requirement ALTER COLUMN id SET DEFAULT nextval('public.test_requirement_id_seq'::regclass);


--
-- Name: test_result id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_result ALTER COLUMN id SET DEFAULT nextval('public.test_result_id_seq'::regclass);


--
-- Name: test_template_competence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_template_competence ALTER COLUMN id SET DEFAULT nextval('public.test_template_competence_id_seq'::regclass);


--
-- Name: user_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.user_profile_id_seq'::regclass);


--
-- Name: user_profile_course id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_course ALTER COLUMN id SET DEFAULT nextval('public.user_profile_course_id_seq'::regclass);


--
-- Name: action action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT action_pkey PRIMARY KEY (id);


--
-- Name: best_competence best_competence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.best_competence
    ADD CONSTRAINT best_competence_pkey PRIMARY KEY (name);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: competence_cluster competence_cluster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_cluster
    ADD CONSTRAINT competence_cluster_pkey PRIMARY KEY (id);


--
-- Name: competence_equality competence_equality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_equality
    ADD CONSTRAINT competence_equality_pkey PRIMARY KEY (id);


--
-- Name: competence_family competence_family_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_family
    ADD CONSTRAINT competence_family_pkey PRIMARY KEY (id);


--
-- Name: competence_group competence_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_group
    ADD CONSTRAINT competence_group_pkey PRIMARY KEY (id);


--
-- Name: competence competence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence
    ADD CONSTRAINT competence_pkey PRIMARY KEY (id);


--
-- Name: course course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (id);


--
-- Name: hse_group hse_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_group
    ADD CONSTRAINT hse_group_pkey PRIMARY KEY (id);


--
-- Name: hse_requirement_rating hse_requirement_rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_requirement_rating
    ADD CONSTRAINT hse_requirement_rating_pkey PRIMARY KEY (id);


--
-- Name: hse_stats_competence hse_stats_competence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_stats_competence
    ADD CONSTRAINT hse_stats_competence_pkey PRIMARY KEY (competence_id);


--
-- Name: menu_option menu_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_option
    ADD CONSTRAINT menu_option_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: organisational_unit organisational_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisational_unit
    ADD CONSTRAINT organisational_unit_pkey PRIMARY KEY (id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (id);


--
-- Name: position_stats position_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_stats
    ADD CONSTRAINT position_stats_pkey PRIMARY KEY ("position");


--
-- Name: position_tc position_tc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_tc
    ADD CONSTRAINT position_tc_pkey PRIMARY KEY (id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: requirement_rating requirement_rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_rating
    ADD CONSTRAINT requirement_rating_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: statistics_competence statistics_competence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics_competence
    ADD CONSTRAINT statistics_competence_pkey PRIMARY KEY (competence_id);


--
-- Name: test_answer test_answer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answer
    ADD CONSTRAINT test_answer_pkey PRIMARY KEY (id);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: test_requirement test_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_requirement
    ADD CONSTRAINT test_requirement_pkey PRIMARY KEY (id);


--
-- Name: test_result test_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_result
    ADD CONSTRAINT test_result_pkey PRIMARY KEY (id);


--
-- Name: test_template_competence test_template_competence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_template_competence
    ADD CONSTRAINT test_template_competence_pkey PRIMARY KEY (id);


--
-- Name: test_template test_template_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_template
    ADD CONSTRAINT test_template_pkey PRIMARY KEY (id);


--
-- Name: user_profile uk_dsesn8a9e2voa44rvy7v79i25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT uk_dsesn8a9e2voa44rvy7v79i25 UNIQUE (sap_id);


--
-- Name: user_profile_course user_profile_course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_course
    ADD CONSTRAINT user_profile_course_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: hse_requirement_rating fk1cvfd2loo39pf285s7sm6gwch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_requirement_rating
    ADD CONSTRAINT fk1cvfd2loo39pf285s7sm6gwch FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: test_answer fk22o0muf8yfiafse44pvq6y2at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answer
    ADD CONSTRAINT fk22o0muf8yfiafse44pvq6y2at FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: test_result fk2bloufvrmdy64lstceaeeu1px; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_result
    ADD CONSTRAINT fk2bloufvrmdy64lstceaeeu1px FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: menu_option fk2ibq1ejayd7mgi2jhahgi13jc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_option
    ADD CONSTRAINT fk2ibq1ejayd7mgi2jhahgi13jc FOREIGN KEY (parent_id) REFERENCES public.menu_option(id);


--
-- Name: competence fk2k8hcp62g4v7srr7vpvaumcyu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence
    ADD CONSTRAINT fk2k8hcp62g4v7srr7vpvaumcyu FOREIGN KEY (responsible_manager_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: permission fk31ek6djuqpqruvgku1ghsqja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT fk31ek6djuqpqruvgku1ghsqja FOREIGN KEY (action_id) REFERENCES public.action(id);


--
-- Name: menu_option_role fk49faee1y986uil1m8oyio6np1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_option_role
    ADD CONSTRAINT fk49faee1y986uil1m8oyio6np1 FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: test_requirement fk4bm29s5tj1791e3uwbqyfel6x; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_requirement
    ADD CONSTRAINT fk4bm29s5tj1791e3uwbqyfel6x FOREIGN KEY (position_tc_id) REFERENCES public.position_tc(id) ON DELETE CASCADE;


--
-- Name: test_user_profile fk4rdbj299p033kijwt7sr99lbm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_user_profile
    ADD CONSTRAINT fk4rdbj299p033kijwt7sr99lbm FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: test fk51i73mnd7of3ts0v09j0uqoxl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT fk51i73mnd7of3ts0v09j0uqoxl FOREIGN KEY (created_by) REFERENCES public.user_profile(id);


--
-- Name: organisational_unit fk55il6df18xebcfs4b877n9hsf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisational_unit
    ADD CONSTRAINT fk55il6df18xebcfs4b877n9hsf FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


--
-- Name: competence fk5d2pltfq5upop0kbgtcwmsmry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence
    ADD CONSTRAINT fk5d2pltfq5upop0kbgtcwmsmry FOREIGN KEY (competence_group_id) REFERENCES public.competence_group(id) ON DELETE CASCADE;


--
-- Name: hse_group_competence fk65uq3c50wh57svoiv6b8ceofi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_group_competence
    ADD CONSTRAINT fk65uq3c50wh57svoiv6b8ceofi FOREIGN KEY (competence_id) REFERENCES public.competence(id) ON DELETE CASCADE;


--
-- Name: test_requirement fk6rdw52aqdhph27q0iususbyjl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_requirement
    ADD CONSTRAINT fk6rdw52aqdhph27q0iususbyjl FOREIGN KEY (competence_id) REFERENCES public.competence(id) ON DELETE CASCADE;


--
-- Name: organisational_unit fk6wa8xble5r7i780qijj8e9d51; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisational_unit
    ADD CONSTRAINT fk6wa8xble5r7i780qijj8e9d51 FOREIGN KEY (organisational_unit_superior_id) REFERENCES public.organisational_unit(id) ON DELETE CASCADE;


--
-- Name: test_answer fk76ilvvr9tkoqhwks9vpr8wmv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answer
    ADD CONSTRAINT fk76ilvvr9tkoqhwks9vpr8wmv FOREIGN KEY (test_result_id) REFERENCES public.test_result(id) ON DELETE CASCADE;


--
-- Name: user_profile fk7t1gmrf49hae2g0d2e6qy08j9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fk7t1gmrf49hae2g0d2e6qy08j9 FOREIGN KEY (hse_manager_id) REFERENCES public.user_profile(id);


--
-- Name: position fk8dw40s69wm3gtwev4dq0il32h; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT fk8dw40s69wm3gtwev4dq0il32h FOREIGN KEY (hse_group_id) REFERENCES public.hse_group(id);


--
-- Name: hse_requirement_rating fk93vfpr910rnvaxju2bjs6xbpu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_requirement_rating
    ADD CONSTRAINT fk93vfpr910rnvaxju2bjs6xbpu FOREIGN KEY (test_id) REFERENCES public.test(id) ON DELETE CASCADE;


--
-- Name: user_profile_course fk9t025pcqrpyg95e8lxsg6tymm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_course
    ADD CONSTRAINT fk9t025pcqrpyg95e8lxsg6tymm FOREIGN KEY (test_id) REFERENCES public.test(id);


--
-- Name: competence_family fka1f8yiht1j5q65812ees12ey0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_family
    ADD CONSTRAINT fka1f8yiht1j5q65812ees12ey0 FOREIGN KEY (competence_cluster_id) REFERENCES public.competence_cluster(id) ON DELETE CASCADE;


--
-- Name: requirement_rating fkak3buymb3ff0lv2lb9uk9qose; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_rating
    ADD CONSTRAINT fkak3buymb3ff0lv2lb9uk9qose FOREIGN KEY (test_requirement_id) REFERENCES public.test_requirement(id);


--
-- Name: user_profile fkandvcjvld8f0t4yl3tjulwlyf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fkandvcjvld8f0t4yl3tjulwlyf FOREIGN KEY (organisational_unit_id) REFERENCES public.organisational_unit(id);


--
-- Name: user_profile fkb1rgw3f4fxaifoujbnjc7y53d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fkb1rgw3f4fxaifoujbnjc7y53d FOREIGN KEY (position_id) REFERENCES public."position"(id);


--
-- Name: test fkbbk2y742negly1yi1ij6k6uaa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT fkbbk2y742negly1yi1ij6k6uaa FOREIGN KEY (test_template_id) REFERENCES public.test_template(id);


--
-- Name: user_profile_role fkbcv28jasfm03h2ei2shwm5ui8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_role
    ADD CONSTRAINT fkbcv28jasfm03h2ei2shwm5ui8 FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: test fkdpott4jl7bmk6j5164o5gf5eu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT fkdpott4jl7bmk6j5164o5gf5eu FOREIGN KEY (parent_test_id) REFERENCES public.test(id);


--
-- Name: test_result fkef3e8k7fgvkj4mox0lxrkf8hh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_result
    ADD CONSTRAINT fkef3e8k7fgvkj4mox0lxrkf8hh FOREIGN KEY (test_id) REFERENCES public.test(id);


--
-- Name: user_profile fkefad9ox0i7j7o5c6qamijlg4h; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fkefad9ox0i7j7o5c6qamijlg4h FOREIGN KEY (manager_id) REFERENCES public.user_profile(id);


--
-- Name: course fkesvlk1avehhdv7djnmvbf4adg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT fkesvlk1avehhdv7djnmvbf4adg FOREIGN KEY (competence_id) REFERENCES public.competence(id);


--
-- Name: hse_group_competence fkf3mpw5dic13wn7mko2bud6hdu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_group_competence
    ADD CONSTRAINT fkf3mpw5dic13wn7mko2bud6hdu FOREIGN KEY (hse_group_id) REFERENCES public.hse_group(id) ON DELETE CASCADE;


--
-- Name: notification fkfbwb0lp4nt69gqavtnaqlhxn; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fkfbwb0lp4nt69gqavtnaqlhxn FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: competence_group fkfp338im2fxreilsxtflj49pnw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_group
    ADD CONSTRAINT fkfp338im2fxreilsxtflj49pnw FOREIGN KEY (competence_family_id) REFERENCES public.competence_family(id) ON DELETE CASCADE;


--
-- Name: test_user_profile fkg86expbt0g8uop7t3rj9dcslc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_user_profile
    ADD CONSTRAINT fkg86expbt0g8uop7t3rj9dcslc FOREIGN KEY (test_id) REFERENCES public.test(id);


--
-- Name: requirement_rating fkhc09ew89oei31oqstgi0rwkt0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_rating
    ADD CONSTRAINT fkhc09ew89oei31oqstgi0rwkt0 FOREIGN KEY (test_id) REFERENCES public.test(id);


--
-- Name: test_template_competence fki1vm4qn6xrgarv61l0vsvpq47; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_template_competence
    ADD CONSTRAINT fki1vm4qn6xrgarv61l0vsvpq47 FOREIGN KEY (competence_id) REFERENCES public.competence(id) ON DELETE CASCADE;


--
-- Name: test fkihwk6sayyuydaq1pmpv410ip6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT fkihwk6sayyuydaq1pmpv410ip6 FOREIGN KEY (hse_group_id) REFERENCES public.hse_group(id);


--
-- Name: test_question fkk2sfq1wyx19uvwn7pkgk1bc9n; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question
    ADD CONSTRAINT fkk2sfq1wyx19uvwn7pkgk1bc9n FOREIGN KEY (test_id) REFERENCES public.test(id) ON DELETE CASCADE;


--
-- Name: test_question fkk5qvcm9mkgbi8hm4u2mlidm4i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question
    ADD CONSTRAINT fkk5qvcm9mkgbi8hm4u2mlidm4i FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: requirement_rating fklq18ljf1j56ej1jvxjdsa4h3u; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_rating
    ADD CONSTRAINT fklq18ljf1j56ej1jvxjdsa4h3u FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: user_profile_course fkm6bikymnmtxna1li0ji3dtv2o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_course
    ADD CONSTRAINT fkm6bikymnmtxna1li0ji3dtv2o FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: user_profile_role fkmoy1bt7jbxlra3c1jmeekigwm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_role
    ADD CONSTRAINT fkmoy1bt7jbxlra3c1jmeekigwm FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: competence_equality fknlahc6wsl8v2ajcrp0ikhb7j5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_equality
    ADD CONSTRAINT fknlahc6wsl8v2ajcrp0ikhb7j5 FOREIGN KEY (competence_id) REFERENCES public.competence(id);


--
-- Name: menu_option_role fkpm7c376j92sky1j2x6xm1qxv0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_option_role
    ADD CONSTRAINT fkpm7c376j92sky1j2x6xm1qxv0 FOREIGN KEY (menu_option_id) REFERENCES public.menu_option(id);


--
-- Name: notification fkqfhid1ya9u9lr13gj3qq2vc1h; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fkqfhid1ya9u9lr13gj3qq2vc1h FOREIGN KEY (created_by_user_profile_id) REFERENCES public.user_profile(id);


--
-- Name: question fkqothg6c8t1bdyifnlesl2u1fi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT fkqothg6c8t1bdyifnlesl2u1fi FOREIGN KEY (competence_id) REFERENCES public.competence(id);


--
-- Name: test_requirement fkqsc7c8ah58aiiu4wu01m0lvoa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_requirement
    ADD CONSTRAINT fkqsc7c8ah58aiiu4wu01m0lvoa FOREIGN KEY (test_template_id) REFERENCES public.test_template(id) ON DELETE CASCADE;


--
-- Name: competence_equality fkqwn9lmbw9j4wr207dqxua3mse; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competence_equality
    ADD CONSTRAINT fkqwn9lmbw9j4wr207dqxua3mse FOREIGN KEY (test_id) REFERENCES public.test(id);


--
-- Name: hse_requirement_rating fkriy1d5a5a86qjxhvjepuoht41; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hse_requirement_rating
    ADD CONSTRAINT fkriy1d5a5a86qjxhvjepuoht41 FOREIGN KEY (competence_id) REFERENCES public.competence(id) ON DELETE CASCADE;


--
-- Name: test_template_competence fkrrksxd3k363ok10mjfgiyad36; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_template_competence
    ADD CONSTRAINT fkrrksxd3k363ok10mjfgiyad36 FOREIGN KEY (test_template_id) REFERENCES public.test_template(id) ON DELETE CASCADE;


--
-- Name: permission fkrvhjnns4bvlh4m1n97vb7vbar; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT fkrvhjnns4bvlh4m1n97vb7vbar FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: user_profile_course fkssctx0728btepwb454yl0epgj; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_course
    ADD CONSTRAINT fkssctx0728btepwb454yl0epgj FOREIGN KEY (course_id) REFERENCES public.course(id);


--
-- Name: user_profile fkt0syuvssjfg41dp4sgkt2k25v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fkt0syuvssjfg41dp4sgkt2k25v FOREIGN KEY (position_tc_id) REFERENCES public.position_tc(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict T39LxEGKUsWUa9l9ree6KSr3BM6s1Hnt5a792xJpDyGwivke2vjqQW89JMl4YaG


-- Sample data: menu_option_role
menu_option_id,role_id
15,4
11,2
8,1
15,1
11,5

-- Sample data: best_competence
name,avg_rating

-- Sample data: action
id,icon,name,url
1,getById,getById,/entity/getById/{id}
2,create,create,/entity/create
3,save,save,/entity/save
4,edit,edit,/entity/edit/{id}
5,delete,delete,/entity/delete/{id}
6,import,import,/entity/import
7,export,export,/entity/export/{id}

-- Sample data: course
id,description,name,path,competence_id,info,table_of_contents
11,test,M2-RM-1.13 Obuka za BR pri radu sa ručnim mehanizovanim alatom,M2-RM-1.13 Obuka za BR pri radu sa ručnim mehanizovanim alatom.pdf,M2-RM-1.13,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
10,"Ova obuka obuhvata pravila bezbednog rada sa kompresorima, uključujući prepoznavanje potencijalnih opasnosti i primenu preventivnih mera pre početka rada. Obuka se fokusira na pravilnu upotrebu lične zaštitne opreme, tehničku ispravnost kompresora i mera za smanjenje rizika. Takođe, obuhvata posebne mere koje se primenjuju u slučajevima intervencija, poput kontrole sistema za izduvne gasove, monitoringa stanja opreme i sprečavanja opasnosti od požara i eksplozija",M2-RM-1.12 Obuka za BR pri radu sa kompresorima,M2-RM-1.12 Obuka za BR pri radu sa kompresorima.pdf,M2-RM-1.12,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
12,"Ova obuka je usmerena na siguran rad u kotlarnicama, uz upotrebu pogonskih energenata poput prirodnog gasa, mazuta i uglja. Obuhvata pravila bezbednog rada, korišćenje lične zaštitne opreme, održavanje radnog prostora i mere zaštite od požara. Posebna pažnja posvećena je proveri ispravnosti opreme pre pokretanja kotlova, kao i procedurama u vanrednim situacijama, poput požara ili povreda na radu. Ova obuka ima za cilj da osposobi radnike za sigurno rukovanje kotlovima, uz primenu preventivnih mera i procedura za zaštitu na radu",M2-RM-1.14 Obuka za BR pri rukovanju kotlovima,M2-RM-1.14 Obuka za BR pri rukovanju kotlovima.pdf,M2-RM-1.14,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
9,test,"M2-RM-1.11 Obuka za BR sa travokosačicom, ručnom kosilicom na motorni pogon","M2-RM-1.11 Obuka za BR sa travokosačicom, ručnom kosilicom na motorni pogon.pdf",M2-RM-1.11,"{""time"":""3 sata slušanja"",""slidesCount"":""4 slajda"",""questionTypes"":""Svi zaposleni""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
13,test,M2-RM-1.15 Obuka za BR pri elektrolučnom zavarivanju,M2-RM-1.15 Obuka za BR pri elektrolučnom zavarivanju.pdf,M2-RM-1.15,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
14,test,M2-RM-1.16 Obuka za BR pri gasnom zavarivanju i sečenju,M2-RM-1.16 Obuka za BR pri gasnom zavarivanju i sečenju.pdf,M2-RM-1.16,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
19,test,M2-RM-1.20 Obuka za osposobljavanje za BR sa električnom opremom i instalacijama i alatom na električnio pogon,M2-RM-1.20 Obuka za osposobljavanje za BR sa električnom opremom i instalacijama i alatom na električnio pogon.pdf,M2-RM-1.20,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
20,test,M2-RM-1.21 Obuka za bezbedan rad prilikom rukovanja i održavanja opreme i instalacija u EX izvedbi,M2-RM-1.21 Obuka za bezbedan rad prilikom rukovanja i održavanja opreme i instalacija u EX izvedbi.pdf,M2-RM-1.21,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
21,test,M2-RM-1.22 Obuka za BR sa dizel-električnim agregatima,M2-RM-1.22 Obuka za BR sa dizel-električnim agregatima.pdf,M2-RM-1.22,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"
17,test,M2-RM-1.19 Obuka za BR pri utovaru i istovaru tereta,M2-RM-1.19 Obuka za BR pri utovaru i istovaru tereta.pdf,M2-RM-1.19,"{""time"":""3sataslušanja"",""slidesCount"":""4slajda"",""questionTypes"":""Višetipovapitanja""}","[{""sectionName"":""Section1"",""subsections"":[{""subsectionName"":""Subsection1.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection1.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection1.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection1.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section2"",""subsections"":[{""subsectionName"":""Subsection2.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection2.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection2.3"",""subsectionTime"":""5min""},{""subsectionName"":""Subsection2.4"",""subsectionTime"":""15min""}]},{""sectionName"":""Section3"",""subsections"":[{""subsectionName"":""Subsection3.1"",""subsectionTime"":""15min""},{""subsectionName"":""Subsection3.2"",""subsectionTime"":""20min""},{""subsectionName"":""Subsection3.3"",""subsectionTime"":""2hours""},{""subsectionName"":""Subsection3.4"",""subsectionTime"":""15min""}]}]"

-- Sample data: competence_equality
id,is_num_of_question_per_level_equal,competence_id,test_id
3088,t,ONG2,452
3089,t,TIT3,452
3090,t,OSG1,452
3091,t,TIT2,452
3092,t,OON1,452
3093,t,MIB3,452
3094,t,MBU1,452
3095,t,MIN1,452
3096,t,ONG3,452
3097,f,PEB1,452

-- Sample data: hse_group_competence
hse_group_id,competence_id
XXX_UPS_HSE_SIS_PNG,M2-RM-1.11
XXX_UPS_HSE_SIS_PNG,M2-RM-1.13
XXX_UPS_HSE_SIS_PNG,M2-RM-1.14
XXX_UPS_HSE_SIS_PNG,M2-RM-1.19
XXX_UPS_HSE_SIS_PNG,M2-RM-1.2
XXX_UPS_HSE_SIS_PNG,M2-RM-1.20
XXX_UPS_HSE_SIS_PNG,M2-RM-1.21
XXX_UPS_HSE_SIS_PNG,M2-RM-1.22
XXX_UPS_HSE_SIS_PNG,M2-RM-1.23
XXX_UPS_HSE_SIS_PNG,M2-RM-1.24

-- Sample data: competence_cluster
id,name,type
0,HSE,HSE
14,Proizvodnja,TC
20,Proizvodnja,TC
4,Razrada,TC
2,Podrška biznisu,TC
13,Proizvodnja,TC
17,Proizvodnja,TC
18,Proizvodnja,TC
19,Proizvodnja,TC
7,Proizvodnja,TC

-- Sample data: hse_stats_competence
competence_id,achieved,competence_name,max,planned

-- Sample data: competence
id,description,indicator_level,indicator_name,name,passing_indicator,type,competence_group_id,responsible_manager_id
M2-RM-1.11,,3,Upoznat je sa bezbednim načinom rada sa opremom za košenje travnatih površina,"Obuka za bezbedan rad pri radu sa travokosačicom, ručnom kosilicom na motorni pogon, trimerom i traktorskom kosačicom",2,HSE,M2-RM,10162
M3-MS-1.29,,3,Upoznat je sa sistemom za Monitoring zaštite životne sredine(*grupa ZŽS),Monitoring zaštite životne sredine(*grupa ZŽS),2,HSE,M3-MS,10162
M2-RM-1.12,,3,Upoznat je sa bezbednim načinom rada sa kompresorima,Obuka za bezbedan rad pri radu sa kompresorima,2,HSE,M2-RM,10162
M2-RM-1.13,,3,Upoznat je sa bezbednim načinom rada sa ručnim mehanizovanim alatima,Obuka za bezbedan rad pri radu sa ručnim mehanizovanim alatima,2,HSE,M2-RM,10162
M2-RM-1.14,,3,Upoznat je sa bezbednim načinom rada sa kotlovima,Obuka za bezbedan rad pri rukovanju kotlovima,2,HSE,M2-RM,10162
M2-RM-1.15,,4,Upoznat sa bezebdnim radom pri elektrolučnom zavarivanje,Obuka za bezbedan rad pri elektrolučnom zavarivanju,3,HSE,M2-RM,10162
M2-RM-1.16,,4,Upoznat sa bezbednim radom pri gasnom zavarivanju i sečenju,Obuka za bezbedan rad pri gasnom zavarivanju i sečenju,3,HSE,M2-RM,10162
M2-RM-1.17,,4,Upoznat je sa bezbednim načinom rada sa sredstvima unutrašnjeg transporta,Obuka za bezbedan rad sa sredstvima unutrašnjeg transporta,3,HSE,M2-RM,10162
M2-RM-1.18,,4,Upoznat je sa bezbednim načinom rada sa dizalicom,"Obuka za bezbedan rad sa dizalicom (mosnom, kranskom…)",3,HSE,M2-RM,10162
M2-RM-1.19,,3,Upoznat je sa bezbednim načinom rada pri utovaru/istovaru tereta,Obuka za bezbedan i zdrav rad pri utovaru/istovaru tereta,2,HSE,M2-RM,10162

-- Sample data: hse_requirement_rating
id,fulfill,score,competence_id,test_id,user_profile_id
3205,t,5,M2-RM-1.23,301,10214
3206,t,3,M2-RM-2.24,301,10214
3207,t,5,M3-MS-1.10,301,10214
3208,t,3,M2-RM-1.57,301,10214
3209,t,3,M2-RM-2.18,301,10214
3210,t,3,M2-RM-1.14,301,10214
1974,f,0,M3-MS-1.11,272,10162
1975,f,0,M3-MS-2.4,272,10162
1976,f,0,M3-MS-1.13,272,10162
1977,f,0,M3-MS-2.7,272,10162

-- Sample data: menu_option
id,icon,name,ordinal_number,url,parent_id
1,dashboard,Dashboard,100,/,
2,courses,Courses,200,/courses,
6,team-members,Team_members,400,/team-members,
7,notifications,Notifications,500,/notifications,
9,import,Users-settings,610,/settings/users,8
10,import,Courses-settings,620,/settings/courses,8
11,import,Tests-settings,630,/settings/tests,8
12,settings,Account_settings,1000,/account-settings,
4,test,Technical_competences,310,/technical-competences,
5,test,HSE,320,/hse,

-- Sample data: company
id,name
1,XXX a.d.
2,XXX
3,Company Name Here

-- Sample data: competence_group
id,name,type,competence_family_id
PRIPR_ERO22,Sektor za pripremu i otpremu nafte i gasa,TC,82
PRIPR_ESBK22,Sektor za pripremu i otpremu nafte i gasa,TC,82
PRIPR_TSIPN22,Sektor za pripremu i otpremu nafte i gasa,TC,82
PRIPR_TPTO22,Sektor za pripremu i otpremu nafte i gasa,TC,82
PROIZ_PARAF22,SPNiG,TC,12
PROIZ_GL22,CUD,TC,12
PROIZ_ER22,CUD,TC,12
PROIZ_DP22,CUD,TC,12
PROIZ_PCP22,CUD,TC,12
PROIZ_ESP22,CUD,TC,12

-- Sample data: hse_group
id,min_question_count_hse,name,program,risk_priority,total_question_count_hse
abc_UPS_HSE_PTG_PION,128,Operateri za pripremu i otpremu nafte,program 12,1,176
abc_UPS_HSE_PTG_PIOG,120,Operateri za pripremu i otpremu gasa,program 13,1,165
abc_UPS_HSE_PTG_PIONG,130,Operateri za pripremu i otpremu nafte i gasa,program 14,1,179
abc_UPS_HSE_PTG_TNGCO2,128,Zaposleni u procesu proizvodnje TNG i gazolina,program 15,1,178
abc_UPS_HSE_PTG_ODR,137,Zaposleni na održavanju,program 16,1,188
abc_UPS_HSE_PTG_ElODR,130,Zaposleni na elektro-održavanju,program 17,1,178
abc_UPS_HSE_PTG_TE,102,Zaposleni na termoenergetskim postrojenjima,program 18,1,139
abc_UPS_HSE_PTG_LAB,53,Zaposleni u laboratoriji,program 20,2,73
abc_UPS_HSE_PTG_RK,85,Rukovodioci Pogona PITNIG,program 21,2,115
abc_UPS_HSE_PTG_ING,95,Inženjeri i specijalisti u PITNIG,program 22,2,129

-- Sample data: requirement_rating
id,fulfill,rating,test_id,test_requirement_id,user_profile_id
1124,f,1.5,418,60750,10039
1125,f,1.75,418,60740,10039
1126,f,1.75,418,60734,10039
1127,t,2,418,60738,10039
1128,t,2,418,60751,10039
1129,t,4,418,60743,10039
1130,t,3.25,418,60749,10039
1131,t,4,418,60748,10039
1132,t,3.5,418,60739,10039
1133,f,1.5,418,60736,10039

-- Sample data: position_stats
position,less_then_70,more_then_70

-- Sample data: role
id,name
1,ROLE_ADMIN
2,ROLE_MANAGER
3,ROLE_REGULAR
4,ROLE_HSE
5,ROLE_TC
0,ROLE_NULL

-- Sample data: position_tc
id,name
UPS849100011,Inženjer za tehnologiju proizvodnje nafte i gasa
UPS849100007,Inženjer za operativno upravljanje procesima hemizacije u proizvodnji
UPS849100006,Vodeći inženjer za operativno upravljanje procesima hemizacije u  proizvodnji
UPS849100005,Vodeći geolog za operativnu kontrolu bušotinskog fonda
UPS849100003,Vodeći inženjer za tehnologiju proizvodnje nafte i gasa
UPS849100008,Vođa tima za analitičku kontrolu proizvodnje
UPS856000014,Vodeći inženjer za utilizaciju slojne vode
UPS856000010,Vodeći inženjer za tehnologiju proizvodnje
UPS856400001,Rukovodilac službe za hemizaciju
UPS856000015,Inženjer za tehnologiju proizvodnje

-- Sample data: organisational_unit
id,name,company_id,organisational_unit_superior_id
423,Blok istraživanje i proizvodnja,1,
424,Direkcija za proizvodnju nafte i gasa,1,423
425,Proizvodni Departman,1,424
426,Pogon za pripremu i transport nafte i gasa,1,425
427,Odeljenje za eksploataciju kogeneracionih postrojenja i elektrana,1,426
428,Departman laboratorije downstream,2,
429,"Služba za ispitivanje derivata nafte,ulja i maziva",2,428
430,Biznis segment za integrisana rešenja,2,
431,Laboratorija Upstream,2,430
432,Odeljenje za analizu stena,2,431

-- Sample data: position
id,name,hse_group_id
NTC960500001,ntc,
UPS845700009,Glavni operater termoenergetskog postrojenja,
NTC830500014,Vođa smene laboratorije,
NTC830500008,Tehničar za kontrolu ispitivanja ulja,
NTC960320015,Tehničar za geohemijska ispitivanja,
NTC830500027,"Tehničar za kontrolu voda, nafte i naftnih derivata",
NFS955000011,Saradnik za registraciju vozila i dokumentaciju,
NTC830500026,Saradnik za zalihe i laboratorijska ispitivanja,
NTC830500017,Vodeći inženjer za ispitivanje ulja,
NTC960350002,Specijalista za laboratorijsku analizu,

-- Sample data: notification
id,created_at,created_by_system,message,status,updated_at,url,created_by_user_profile_id,user_profile_id
9640,2024-09-26 11:57:46.231242,f,Kreiran je novi test iz tehničkih kompetencija. Udjite na sledeći link kako biste započeli testiranje: ,unseen,,/technical-competences/204,3887,9916
9641,2024-09-30 22:28:27.321945,f,Kreiran je novi test iz tehničkih kompetencija. Udjite na sledeći link kako biste započeli testiranje: ,unread,,/technical-competences/205,3887,9572
9642,2024-10-01 09:48:38.884152,f,Kreiran je novi HSE test. Udjite na sledeći link kako biste započeli testiranje: ,unread,,/hse/206,3887,3887
9643,2024-10-01 11:17:31.91405,f,Kreiran je novi HSE test. Udjite na sledeći link kako biste započeli testiranje: ,unread,,/hse/207,3887,3887
9729,2024-10-07 09:15:41.292727,t,Zaposleni Martinović Bojan(14523) je pao HSE test drugi put za redom!,unread,,"",,8359
9734,2024-10-07 13:07:34.358919,t,Kreiran je novi HSE test sa kompetencijama za koje niste zadovoljili normu. Udjite na sledeći link kako biste započeli testiranje: ,unread,,/hse/235,,9653
9748,2024-10-07 13:36:42.566457,t,Niste zadovoljili normu za kompetenciju 'BZR osnove'. Udjite na sledeći link za obuku: ,unread,,/courses/details/6,,10162
9754,2024-10-07 13:54:03.643727,t,Niste zadovoljili normu za kompetenciju 'Bezbedan rad pri kretanju'. Udjite na sledeći link za obuku: ,unread,,/courses/details/44,,10951
9755,2024-10-07 13:54:03.651561,t,Niste zadovoljili normu za kompetenciju 'Obaveštavanje o HЅE događajima'. Udjite na sledeći link za obuku: ,unread,,/courses/details/89,,10951
9756,2024-10-07 13:54:03.653933,t,Niste zadovoljili normu za kompetenciju 'BZR osnove'. Udjite na sledeći link za obuku: ,unread,,/courses/details/6,,10951

-- Sample data: statistics_competence
competence_id,achieved,competence_name,planned

-- Sample data: test
id,created_at,description,iteration,name,sys_description,total_time,type,created_by,hse_group_id,test_template_id,parent_test_id
272,2024-10-14 08:39:19.369484,,1,14.10.24_HSE,,10140,HSE,10162,ABC_UPS_HSE_HSE,,
274,2024-10-14 13:46:56.678193,,2,14.10.24_HSE KTD,,9840,HSE,0,ABC_UPS_HSE_HSE,,272
291,2024-10-17 12:51:35.474969,,2,14.10.24_HSE KTD,,600,HSE,0,ABC_UPS_HSE_HSE,,272
298,2024-10-18 14:24:00.992556,,2,14.10.24_HSE KTD,,420,HSE,0,ABC_UPS_HSE_HSE,,272
300,2024-10-21 10:26:08.862804,,1,2024_HSE_ADM_TRN,,8580,HSE,10162,ABC_UPS_HSE_ADM_TRN,,
301,2024-10-21 10:32:37.587147,,1,2024_Operateri_SVB_BrigadaSP,,10320,HSE,9947,ABC_UPS_HSE_SIS_PNG,,
303,2024-10-21 10:56:11.098138,,1,2024_Operateri_SVB_BrigadaKP,,10320,HSE,9947,ABC_UPS_HSE_SIS_PNG,,
304,2024-10-21 10:56:18.599276,,1,2024_Operateri_SVB_BrigadaKP,,10320,HSE,9947,ABC_UPS_HSE_SIS_PNG,,
305,2024-10-21 11:04:01.780541,,1,2024_Brigadiri_Tehničari_SVB,,15420,HSE,9947,ABC_UPS_HSE_SIS_RKB,,
307,2024-10-21 11:07:28.130637,,1,2024_Rukovodioci_Pogona_SVB,,6900,HSE,9947,ABC_UPS_HSE_SIS_RK,,

-- Sample data: test_user_profile
test_id,user_profile_id
409,9573
409,9572
272,9947
272,10149
272,9854
272,8958
272,8301
272,10707
272,8846
272,8379

-- Sample data: user_profile_role
user_profile_id,role_id
0,1
8256,3
10876,3
11648,1
10785,1
12244,1
8958,4
9590,5
3887,2
12237,3

-- Sample data: test_answer
id,answer,correct,question_id,test_result_id
10655,Svim raspoloživim sredstvima osim vodom ,t,211471,187
10656,"Legne na pod i kotrlja se po podu. Na ovaj način će ugasiti vatru i 
spasiti svoj život ",t,211472,187
10657,Na svakih šest meseci ,t,211706,187
10658,Pre svake upotrebe uređaja ,t,211708,187
10659,"Od strane Lica u pripravnosti, Lica monitoring atmosfere, rukovodioca radova kada merene vrednosti eksplozivnosti nisu u granicama dozoljenih ili ako je uređaj za merenje eksplozivnosti prestao da radi ",t,211712,187
10660,20kg,f,211729,187
10661,Prenošenje ili pridržavanje tereta ,t,211732,187
10662,"Čista, prohodna, osvetljena i vidljiva, bez opstrukcija ",t,211735,187
10663,Bezbednijim i udobnijim ,t,211772,187
10664,45-60cm ,t,211773,187

-- Sample data: test_result
id,date_time,passed,percentage,remaining_time,stopped,test_id,user_profile_id
1408,2024-10-30 10:27:55.25509,t,100,,f,405,9158
268,2024-10-22 09:13:01.275521,t,96,,f,272,9947
1424,2024-10-30 11:01:30.014017,t,100,,f,639,8541
187,2024-10-16 11:44:16.830842,t,96,,f,274,10162
1438,2024-10-30 11:39:41.422484,t,92,,f,724,11782
233,2024-10-21 14:00:33.05007,f,91,,f,300,9012
287,2024-10-22 12:09:10.553639,t,95,,f,351,9519
234,2024-10-21 14:07:20.566576,t,100,,f,345,9012
235,2024-10-21 14:14:55.178905,f,91,,f,333,9163
1445,2024-10-30 11:59:29.377066,f,94,,f,461,9047

-- Sample data: test_requirement
id,ponder,competence_id,position_tc_id,test_template_id
58757,1,TKRB_PCIO22,UPS810200003,1
58758,1,TKRB_UGO22,UPS810200003,1
58759,1,TKRB_PBK22,UPS810200003,1
58760,1,TKRB_TL22,UPS810200003,1
58761,1,TKRB_UFB22,UPS810200003,1
58762,2,TKRB_UER22,UPS810200003,1
58763,2,SIPP_BP22,UPS810200003,1
58764,2,TKRB_BP22,UPS810200003,1
58765,2,TKRB_PCIO22,UPS810200002,1
58766,2,TKRB_UGO22,UPS810200002,1

-- Sample data: user_profile_course
id,confirmed,course_id,test_id,user_profile_id,start_time
579,t,95,319,11707,2024-10-21 11:52:09.418245
580,t,71,319,11707,2024-10-21 11:52:09.420807
581,t,7,319,11707,2024-10-21 11:52:09.42281
531,f,99,274,10162,2024-10-14 13:46:56.722243
532,f,50,274,10162,2024-10-14 13:46:56.726963
533,f,74,274,10162,2024-10-14 13:46:56.731745
534,f,82,274,10162,2024-10-14 13:46:56.736416
535,f,38,274,10162,2024-10-14 13:46:56.741011
536,f,95,274,10162,2024-10-14 13:46:56.745665
537,f,88,274,10162,2024-10-14 13:46:56.750313

-- Sample data: test_template
id,created_at,name
1,2024-10-12,P-2 DBBR 
2,2024-10-12,P-2 DBBR 
3,2024-10-12,P-2 UPS administracija SIPP
4,2024-10-12,P-2 UPS administracija SKP
5,2024-10-12,P-2 UPS administracija SPNiG
6,2024-10-12,P-2 UPS AMR
7,2024-10-12,P-2 UPS cevovodi
8,2024-10-12,P-2 UPS CKP
9,2024-10-12,P-2 UPS CUP
10,2024-10-12,P-2 UPS DKI

-- Sample data: test_template_competence
id,number_of_questions,competence_id,test_template_id
5556,16,CEV_KZ24,7
6578,16,CEV_KZ24,50
7154,6,ABA11,72
7155,6,ABA12,72
7156,6,ABA13,72
7157,6,ABA14,72
7158,6,ABA15,72
7159,6,BBB11,72
7160,6,VVV11,72
7161,6,VVV12,72

-- Sample data: test_question
test_id,question_id
494,212159
494,212161
494,212166
494,212162
494,212213
494,212209
494,212208
494,212212
494,212221
879,212208

-- Sample data: user_profile
id,email,end_date,image_path,lastname_firstname,password,phone,sap_id,start_date,sys_description,username,hse_manager_id,manager_id,organisational_unit_id,position_id,hse_blocked,position_tc_id,"id,""email"",""end_date"",""image_path"",""lastname_firstname"",""passwo"
9436,ABC@XXX.RS,,, ,$2a$10$8APQQLy4M6EzFqt6GjddVeSg6wPIHZCCoGvexjcwBFRAYeoxJXYN.,,22960,2023-03-07,Shoshin Andrei,22960,10162,10717,753,UPS300000031,f,,
8635,ABCABC@XXX.RS,,, ,$2a$10$UVEm9HNB2K49GzsxbaG.GuPNww.EGcon/Td/f5oOywvIY/q151F5q,0648888774,12308,2020-06-01,Stanić Svetlana,12308,10162,9436,451,UPS650000001,f,,
10170,ABCABCABC@XXX.RS,,, ,$2a$10$MZWh8YoMy9oszpzgJ7L6J.65BEhGLeknIUcr3m5esRVvRcitWleP2,0648885690,18034,2018-11-01,Popov Radovan,18034,10162,8635,451,UPS650000014,f,,
8258,.MUXYZNJIN@XXX.RS,,, ,$2a$10$dfrkLy8zxu0E/C0l/3SRe.eYaU4PNii2ZEs32am09WIoDochbDUaK,0648884603,156,2021-03-11,Munjin Androniki,156,8359,8257,429,NTC830500014,f,,
10629,XYZXYZ@XXX.RS,,, ,$2a$10$xJMGir.eXPWV.g/u01299uoYzoDbwZDriO6Sf.srlH1K5EfuaCISG,0648887940,22273,2022-10-03,Ilić Milan,22273,10162,8289,450,UPS850210003,f,UPS850210003,
9947,XYZXYZXYZ@XXX.RS,,, ,$2a$10$9tR/6HTNJcDkPKxDdFAaxu9S.YbdPVJYwrQDEmeSoKs8qb3S5Wdcy,0648882655,16681,2020-03-31,Panić Vladimir,16681,10162,8291,452,UPS651000002,f,,
10283,QWX1@XXX.RS,,, ,$2a$10$jmQjfDA5oBuquIQzznxdAOH4Q4L5FpXgoAsxjacaJKooTHZ1Dogia,0648396889,18619,2022-11-30,Bubalo Branislav,18619,10162,8579,817,UPS727000007,f,UPS860000015,
9926,QWX2@XXX.RS,,, ,$2a$$JqBY.DdrbA5wU9yVsKb47uJF.FnDjegX09fz6gxkixiEIIzraYj.a,0648881548,16529,2023-05-25,Nestorović Anastasija,16529,10162,8566,578,UPS958000008,f,UPS958000008,
8974,QWX3@XXX.RS,,, ,$2a$10$HAO6NRjDV/PACZvlof8Aludg9rWsyF/P1PmoChX2r7hqfxbhY7ulq,0648882227,10607,2024-05-31,Cimbaljević Zvezdan,10607,10162,8490,552,UPS953000005,f,UPS953000005,
10149,QWX4@XXX.RS,,,,$2a$10$9yL9CiQHio0oHX6S/Yl/M.RnjcotSVVOTZpLXEDvHXY9bVdjyfRcS,0648453839,17970,2020-09-15,Pilipović Nikola,17970,10162,8291,452,UPS651000002,f,,

-- Sample data: question
id,answer_time,correct_answers,external_id,image_path,level,number_of_try,possible_answers,question_type,text,competence_id
211430,60,1,M1-UO-1.1_01,,,,Svaki zaposleni u delokrugu svog rada #Zaposleni koji obavlja stručne poslove bezbednosti i zdravlja na radu #Neposredni/linijski rukovodilac #Direktor organizacionog dela,single_choice,Ko sprovodi propisane mere bezbednosti i zdravlja  na radu u Kompaniji?,M1-UO-1.1
211431,60,1,M1-UO-1.1_02,,,,Čini težu povredu radne dužnosti zbog koje se zaposlenom može otkazati ugovor o radu #Čini lakšu povredu radne dužnosti #Ne čini povredu radne dužnosti #Čini lakšu povredu radne dužnosti zbog koje poslodavac ne može da pokrene disciplinski postupak protiv zaposlenog,single_choice,Ne korišćenjem lične zaštitne opreme na radnom mestu zaposleni:,M1-UO-1.1
211432,60,1,M1-UO-1.1_03,,,,"Da, to je obaveza svakog zaposlenog #Da, ali samo ako mu preti opasnost od smrtnih povreda a ne od lakih povreda #Da, ali samo ako mu preti opasnost po zdravlje #Ne, ne sme da zaustavi radnu aktivnost bez obzira na posledice.",single_choice,Da li je navedena tvrdnja tačna: Ukoliko zaposleni proceni da izvođenje radne aktivnosti nije bezbedno mora da radnu aktivnost zaustavi i o tome obavesti linijskog rukovodioca.,M1-UO-1.1
211433,60,1,M1-UO-1.1_04,,,,"Zaustavite rad i upozorite zaposlenog da radi nebezbedno i uputite ga na bezbedno obavljanje aktivnosti #Nastavite sa izvršenjem svojih zadataka, bez obzira šta i kako rade drugi zaposleni, gledajte svoja posla  #Ne ulazite u diskusiju i prepirke sa drugim zaposlenima #Zaustavite rad i udaljite zaposlenog sa lokacije",single_choice,Ukoliko ste primetili da neki zaposleni ne obavlja rad na ispravan i bezbedan način Vaša je obaveza da:,M1-UO-1.1
211434,60,1,M1-UO-1.1_05,,,,Dužan je da to uradi najbrže moguće #Nije dužan #Dužan je da to uradi kada se završi radna aktivnost #Dužan je da to prijavi nakon završene smene,single_choice,Da li je zaposleni dužan da odmah obavesti neposrednog/linijskog rukovodioca o novim opasnostima i štetnostima koje su se pojavile na radnom mestu a mogu da ugroze njegovu ili bezbednost drugih zaposlenih?,M1-UO-1.1
211435,60,1,M1-UO-1.1_06,,,,Da #Ne #Samo ako ga na to obaveže izabrani lekar #Samo ako on misli da je to potrebno,single_choice,Ukoliko zaposleni ima zdravstveni problem koji bi mogao uticati na njegovu radnu sposobnost obavezan je o istom obavestiti neposrednog/linijskog rukovodioca?,M1-UO-1.1
211436,60,1,M1-UO-1.1_07,,,,"Samo zaposleni  kome je u opisu posla navedena ta aktivnost, koji je stručno osposobljen i osposobljen za bezbedan i zdrav  rad za obavljanje tih poslova. #Svaki zaposleni koji ume da izvrši popravku #Linijski rukovodilac #Supervizor",single_choice,Ko sme otklanjati kvarove na električnim instalacijama?,M1-UO-1.1
211437,60,1,M1-UO-1.1_08,,,,Zone opasnosti od požara i zone opasnosti od eksplozije #Zone zabranjenog fotografisanja #Zone zabrane pristupa #Na objektima Bloka nema utvrđenih zona opasnosti od požara i eksplozija,single_choice,Koje zone opasnosti u smislu zaštite od požara i eksplozija postoje na bušotinama i objektima Bloka?,M1-UO-1.1
211438,60,1,M1-UO-1.1_09,,,,Samo uređaji izvedeni u protiveksplozionoj zaštiti („Ex uređaji“) #Svi električni uređaji #Svi elekrični uređaji koje linijski rukovodilac dozvoli #Električni uređaji sa plastičnim kućištem,single_choice,Kakvi se električni uređaji smeju upotrebljavati na mestima ugroženim od eksplozije (u zonama opasnosti od eksplozije)?,M1-UO-1.1
211439,60,1,M1-UO-1.1_10,,,,"Svi zaposleni bez obzira na opis posla, položaj i funkciju #Zaposleni u neposrednoj proizvodnji #Zaposleni na mestima sa povećanim rizikom #Imenovana HSE lica",single_choice,Koji zaposleni moraju biti obučeni (proći obuku i proveru znanja) iz oblasti Bezbednosti i zdravlja na radu (BZR)?,M1-UO-1.1

-- Sample data: permission
id,entity_type,action_id,role_id
1,UserProfile,1,1
2,UserProfile,2,1
3,UserProfile,3,1
4,UserProfile,4,1
5,UserProfile,5,1
6,UserProfile,6,1
7,Test,2,1
9,Test,1,0
10,Test,4,0
11,HseTest,2,1

-- Sample data: competence_family
id,name,type,competence_cluster_id
1001,BZR,HSE,0
83,Cevovodi,TC,20
134,Pumpni sistemi i ostala mašinska oprema kotlarnice na naftnim i gasnim objektima,TC,21
135,HSE - opšti pojmovi i pravila,TC,22
136,Analiza bezbednosti posla i Planovi spašavanja,TC,22
137,Automatski sistemi zaštite i reagovanja,TC,22
226,"DEA, trafostanice, razvodni ormani",TC,22
139,"Generatori – opšti pojmovi i eksploatacija, pregled i dijagnostika",TC,22
140,Dozvole za rad,TC,22
141,Električna energija - opšti pojmovi i opasnosti,TC,22
